"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { serviceSchema } from "@/lib/validations/service";

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function createServiceAction(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    groupId: formData.get("groupId"),
    priceBaixa: formData.get("priceBaixa"),
    priceMedia: formData.get("priceMedia"),
    priceAlta: formData.get("priceAlta"),
  });

  if (!parsed.success) return firstIssue(parsed.error);

  const count = await prisma.service.count();

  await prisma.service.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      groupId: parsed.data.groupId,
      sortOrder: count,
      prices: {
        create: [
          { tier: "BAIXA", price: parsed.data.priceBaixa },
          { tier: "MEDIA", price: parsed.data.priceMedia },
          { tier: "ALTA", price: parsed.data.priceAlta },
        ],
      },
    },
  });

  revalidatePath("/servicos");
}

export async function updateServiceAction(
  serviceId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  await requireAdmin();

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    groupId: formData.get("groupId"),
    priceBaixa: formData.get("priceBaixa"),
    priceMedia: formData.get("priceMedia"),
    priceAlta: formData.get("priceAlta"),
  });

  if (!parsed.success) return firstIssue(parsed.error);

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      groupId: parsed.data.groupId,
      prices: {
        update: [
          { where: { serviceId_tier: { serviceId, tier: "BAIXA" } }, data: { price: parsed.data.priceBaixa } },
          { where: { serviceId_tier: { serviceId, tier: "MEDIA" } }, data: { price: parsed.data.priceMedia } },
          { where: { serviceId_tier: { serviceId, tier: "ALTA" } }, data: { price: parsed.data.priceAlta } },
        ],
      },
    },
  });

  revalidatePath("/servicos");
}

export async function toggleServiceActiveAction(serviceId: string, active: boolean) {
  await requireAdmin();
  await prisma.service.update({ where: { id: serviceId }, data: { active } });
  revalidatePath("/servicos");
}

export async function deleteServiceAction(serviceId: string) {
  await requireAdmin();
  await prisma.service.delete({ where: { id: serviceId } });
  revalidatePath("/servicos");
}
