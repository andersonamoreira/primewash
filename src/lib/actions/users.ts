"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function createUserAction(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    canReopenWorkOrder: formData.get("canReopenWorkOrder"),
  });

  if (!parsed.success) return firstIssue(parsed.error);

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return "Já existe um usuário com este e-mail.";

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      canReopenWorkOrder: parsed.data.canReopenWorkOrder,
      passwordHash,
    },
  });

  revalidatePath("/usuarios");
}

export async function updateUserAction(
  userId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  await requireAdmin();

  const parsed = updateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
    canReopenWorkOrder: formData.get("canReopenWorkOrder"),
  });

  if (!parsed.success) return firstIssue(parsed.error);

  const passwordHash = parsed.data.password
    ? await bcrypt.hash(parsed.data.password, 10)
    : undefined;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      canReopenWorkOrder: parsed.data.canReopenWorkOrder,
      ...(passwordHash ? { passwordHash } : {}),
    },
  });

  revalidatePath("/usuarios");
}

export async function toggleUserActiveAction(userId: string, active: boolean) {
  const session = await requireAdmin();
  if (session.user.id === userId && !active) {
    throw new Error("Você não pode desativar seu próprio usuário.");
  }

  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/usuarios");
}
