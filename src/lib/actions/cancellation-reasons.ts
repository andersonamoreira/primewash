"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { runAction } from "@/lib/action-result";
import { cancellationReasonSchema } from "@/lib/validations/cancellation-reason";

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function createCancellationReasonAction(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();

  const parsed = cancellationReasonSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return firstIssue(parsed.error);

  const count = await prisma.cancellationReason.count();

  await prisma.cancellationReason.create({
    data: { name: parsed.data.name, sortOrder: count },
  });

  revalidatePath("/configuracoes/motivos-cancelamento");
}

export async function updateCancellationReasonAction(
  reasonId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  await requireAdmin();

  const parsed = cancellationReasonSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return firstIssue(parsed.error);

  await prisma.cancellationReason.update({
    where: { id: reasonId },
    data: { name: parsed.data.name },
  });

  revalidatePath("/configuracoes/motivos-cancelamento");
}

export async function toggleCancellationReasonActiveAction(reasonId: string, active: boolean) {
  return runAction(async () => {
    await requireAdmin();
    await prisma.cancellationReason.update({ where: { id: reasonId }, data: { active } });
    revalidatePath("/configuracoes/motivos-cancelamento");
  });
}

export async function deleteCancellationReasonAction(reasonId: string) {
  return runAction(async () => {
    await requireAdmin();
    await prisma.cancellationReason.delete({ where: { id: reasonId } });
    revalidatePath("/configuracoes/motivos-cancelamento");
  });
}
