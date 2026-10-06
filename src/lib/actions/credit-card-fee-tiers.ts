"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { runAction } from "@/lib/action-result";
import { creditCardFeeTierSchema } from "@/lib/validations/credit-card-fee-tier";

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

async function assertNoOverlap(minInstallments: number, maxInstallments: number, excludeId?: string) {
  const others = await prisma.creditCardFeeTier.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
  });
  const overlaps = others.some((t) => minInstallments <= t.maxInstallments && maxInstallments >= t.minInstallments);
  if (overlaps) {
    throw new Error("Essa faixa de parcelas se sobrepõe a uma faixa já cadastrada.");
  }
}

export async function createCreditCardFeeTierAction(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();

  const parsed = creditCardFeeTierSchema.safeParse({
    minInstallments: formData.get("minInstallments"),
    maxInstallments: formData.get("maxInstallments"),
    feePercent: formData.get("feePercent"),
  });

  if (!parsed.success) return firstIssue(parsed.error);

  try {
    await assertNoOverlap(parsed.data.minInstallments, parsed.data.maxInstallments);
  } catch (err) {
    return err instanceof Error ? err.message : "Erro inesperado.";
  }

  await prisma.creditCardFeeTier.create({
    data: {
      minInstallments: parsed.data.minInstallments,
      maxInstallments: parsed.data.maxInstallments,
      feePercent: parsed.data.feePercent,
    },
  });

  revalidatePath("/configuracoes/taxas-cartao");
}

export async function updateCreditCardFeeTierAction(
  tierId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  await requireAdmin();

  const parsed = creditCardFeeTierSchema.safeParse({
    minInstallments: formData.get("minInstallments"),
    maxInstallments: formData.get("maxInstallments"),
    feePercent: formData.get("feePercent"),
  });

  if (!parsed.success) return firstIssue(parsed.error);

  try {
    await assertNoOverlap(parsed.data.minInstallments, parsed.data.maxInstallments, tierId);
  } catch (err) {
    return err instanceof Error ? err.message : "Erro inesperado.";
  }

  await prisma.creditCardFeeTier.update({
    where: { id: tierId },
    data: {
      minInstallments: parsed.data.minInstallments,
      maxInstallments: parsed.data.maxInstallments,
      feePercent: parsed.data.feePercent,
    },
  });

  revalidatePath("/configuracoes/taxas-cartao");
}

export async function deleteCreditCardFeeTierAction(tierId: string) {
  return runAction(async () => {
    await requireAdmin();
    await prisma.creditCardFeeTier.delete({ where: { id: tierId } });
    revalidatePath("/configuracoes/taxas-cartao");
  });
}
