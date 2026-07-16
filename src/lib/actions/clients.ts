"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireDeletePermission } from "@/lib/guards";
import { clientSchema, motorcycleSchema } from "@/lib/validations/client";

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function createClientAction(_prevState: string | undefined, formData: FormData) {
  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    document: formData.get("document"),
    city: formData.get("city"),
    state: formData.get("state"),
    referralSource: formData.get("referralSource"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return firstIssue(parsed.error);

  const client = await prisma.client.create({ data: parsed.data });

  revalidatePath("/clientes");
  redirect(`/clientes/${client.id}`);
}

export async function updateClientAction(
  clientId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    document: formData.get("document"),
    city: formData.get("city"),
    state: formData.get("state"),
    referralSource: formData.get("referralSource"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return firstIssue(parsed.error);

  await prisma.client.update({ where: { id: clientId }, data: parsed.data });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clientId}`);
  redirect(`/clientes/${clientId}`);
}

export async function deleteClientAction(clientId: string) {
  await requireDeletePermission();
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/clientes");
}

export async function createMotorcycleAction(
  _prevState: string | undefined,
  formData: FormData
) {
  const parsed = motorcycleSchema.safeParse({
    clientId: formData.get("clientId"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    color: formData.get("color"),
    plate: formData.get("plate"),
    cylinderTier: formData.get("cylinderTier"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return firstIssue(parsed.error);

  await prisma.motorcycle.create({ data: parsed.data });

  revalidatePath(`/clientes/${parsed.data.clientId}`);
  redirect(`/clientes/${parsed.data.clientId}`);
}

export async function updateMotorcycleAction(
  motorcycleId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  const parsed = motorcycleSchema.safeParse({
    clientId: formData.get("clientId"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    color: formData.get("color"),
    plate: formData.get("plate"),
    cylinderTier: formData.get("cylinderTier"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return firstIssue(parsed.error);

  await prisma.motorcycle.update({ where: { id: motorcycleId }, data: parsed.data });

  revalidatePath(`/clientes/${parsed.data.clientId}`);
  redirect(`/clientes/${parsed.data.clientId}`);
}

export async function deleteMotorcycleAction(motorcycleId: string, clientId: string) {
  await requireDeletePermission();
  await prisma.motorcycle.delete({ where: { id: motorcycleId } });
  revalidatePath(`/clientes/${clientId}`);
}
