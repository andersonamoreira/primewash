"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { createWorkOrderSchema, PAYMENT_METHODS } from "@/lib/validations/work-order";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/uploads";
import { upsertWorkOrderCalendarEvent, deleteWorkOrderCalendarEvent } from "@/lib/google-calendar";
import { formatCurrency, formatDateTime, PAYMENT_METHOD_LABELS } from "@/lib/format";
import type { CylinderTier } from "@prisma/client";

export async function createWorkOrderAction(input: unknown) {
  const session = await requireUser();
  const parsed = createWorkOrderSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const data = parsed.data;

  if (!data.clientId && !data.newClient) {
    throw new Error("Selecione um cliente existente ou cadastre um novo.");
  }
  if (!data.motorcycleId && !data.newMotorcycle) {
    throw new Error("Selecione uma moto existente ou cadastre uma nova.");
  }

  const workOrder = await prisma.$transaction(async (tx) => {
    let clientId = data.clientId;
    if (!clientId && data.newClient) {
      const client = await tx.client.create({
        data: { name: data.newClient.name, phone: data.newClient.phone },
      });
      clientId = client.id;
    }
    if (!clientId) throw new Error("Cliente inválido.");

    let motorcycleId = data.motorcycleId;
    let cylinderTier: CylinderTier;

    if (!motorcycleId && data.newMotorcycle) {
      const moto = await tx.motorcycle.create({
        data: { ...data.newMotorcycle, clientId },
      });
      motorcycleId = moto.id;
      cylinderTier = moto.cylinderTier;
    } else if (motorcycleId) {
      const moto = await tx.motorcycle.findUnique({ where: { id: motorcycleId } });
      if (!moto) throw new Error("Moto não encontrada.");
      cylinderTier = moto.cylinderTier;
    } else {
      throw new Error("Moto inválida.");
    }

    const prices = await tx.servicePrice.findMany({
      where: { serviceId: { in: data.serviceIds }, tier: cylinderTier },
    });

    if (prices.length !== data.serviceIds.length) {
      throw new Error("Um ou mais serviços selecionados não têm preço definido para essa categoria.");
    }

    const totalAmount = prices.reduce((sum, p) => sum + Number(p.price), 0);

    return tx.workOrder.create({
      data: {
        clientId,
        motorcycleId,
        scheduledAt: new Date(data.scheduledAt),
        estimatedDeliveryAt: new Date(data.estimatedDeliveryAt),
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        totalAmount,
        createdById: session.user.id,
        services: {
          create: prices.map((p) => ({
            serviceId: p.serviceId,
            tier: p.tier,
            price: p.price,
          })),
        },
      },
      include: {
        client: true,
        motorcycle: true,
        services: { include: { service: true } },
      },
    });
  });

  revalidatePath("/ordens");
  revalidatePath("/clientes");

  const googleEventId = await upsertWorkOrderCalendarEvent({
    summary: `OS #${workOrder.number} · ${workOrder.client.name} · ${workOrder.motorcycle.brand} ${workOrder.motorcycle.model}`,
    description: buildCalendarDescription(workOrder),
    start: workOrder.scheduledAt,
    durationMinutes: 120,
  });

  if (googleEventId) {
    await prisma.workOrder.update({ where: { id: workOrder.id }, data: { googleEventId } });
  }

  return { id: workOrder.id };
}

type WorkOrderForCalendar = {
  client: { name: string; phone: string };
  motorcycle: { brand: string; model: string; plate: string };
  services: { service: { name: string } }[];
  totalAmount: unknown;
  paymentMethod: string | null;
  estimatedDeliveryAt: Date | null;
};

function buildCalendarDescription(workOrder: WorkOrderForCalendar) {
  const lines = [
    `Cliente: ${workOrder.client.name} (${workOrder.client.phone})`,
    `Moto: ${workOrder.motorcycle.brand} ${workOrder.motorcycle.model} - ${workOrder.motorcycle.plate}`,
    `Serviços: ${workOrder.services.map((s) => s.service.name).join(", ") || "—"}`,
    `Valor total: ${formatCurrency(String(workOrder.totalAmount))}`,
    `Pagamento: ${workOrder.paymentMethod ? PAYMENT_METHOD_LABELS[workOrder.paymentMethod] : "A definir"}`,
    `Previsão de entrega: ${workOrder.estimatedDeliveryAt ? formatDateTime(workOrder.estimatedDeliveryAt) : "A definir"}`,
  ];
  return lines.join("\n");
}

export async function updateWorkOrderStatusAction(workOrderId: string, status: string) {
  await requireUser();

  const data: { status: "AGENDADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO"; startedAt?: Date; finishedAt?: Date } = {
    status: status as "AGENDADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO",
  };

  if (status === "EM_ANDAMENTO") data.startedAt = new Date();
  if (status === "CONCLUIDO") data.finishedAt = new Date();

  const workOrder = await prisma.workOrder.update({ where: { id: workOrderId }, data });

  if (status === "CANCELADO" && workOrder.googleEventId) {
    await deleteWorkOrderCalendarEvent(workOrder.googleEventId);
    await prisma.workOrder.update({ where: { id: workOrderId }, data: { googleEventId: null } });
  }

  revalidatePath(`/ordens/${workOrderId}`);
  revalidatePath("/ordens");
  revalidatePath("/agenda");
}

export async function setPaymentMethodAction(workOrderId: string, paymentMethod: string) {
  await requireUser();

  if (!PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number])) {
    throw new Error("Forma de pagamento inválida.");
  }

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { paymentMethod: paymentMethod as (typeof PAYMENT_METHODS)[number] },
  });

  revalidatePath(`/ordens/${workOrderId}`);
}

export async function updateWorkOrderNotesAction(workOrderId: string, notes: string) {
  await requireUser();
  await prisma.workOrder.update({ where: { id: workOrderId }, data: { notes } });
  revalidatePath(`/ordens/${workOrderId}`);
}

export async function addDamagePhotoAction(workOrderId: string, formData: FormData) {
  await requireUser();

  const file = formData.get("photo") as File | null;
  const description = (formData.get("description") as string | null) ?? undefined;

  if (!file || file.size === 0) {
    throw new Error("Selecione uma foto.");
  }

  const photoPath = await saveUploadedFile(file, `work-orders/${workOrderId}`);

  await prisma.damagePhoto.create({
    data: { workOrderId, photoPath, description },
  });

  revalidatePath(`/ordens/${workOrderId}`);
}

export async function deleteDamagePhotoAction(photoId: string, workOrderId: string) {
  await requireUser();

  const photo = await prisma.damagePhoto.findUnique({ where: { id: photoId } });
  if (photo) {
    await deleteUploadedFile(photo.photoPath);
    await prisma.damagePhoto.delete({ where: { id: photoId } });
  }

  revalidatePath(`/ordens/${workOrderId}`);
}

export async function deleteWorkOrderAction(workOrderId: string) {
  await requireUser();

  const workOrder = await prisma.workOrder.findUnique({ where: { id: workOrderId } });
  if (workOrder?.googleEventId) {
    await deleteWorkOrderCalendarEvent(workOrder.googleEventId);
  }

  await prisma.workOrder.delete({ where: { id: workOrderId } });
  revalidatePath("/ordens");
}
