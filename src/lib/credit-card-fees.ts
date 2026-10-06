export type CreditCardFeeTier = {
  id: string;
  minInstallments: number;
  maxInstallments: number;
  feePercent: number | string;
};

export function findFeeTierForInstallments<T extends { minInstallments: number; maxInstallments: number }>(
  tiers: T[],
  installments: number
): T | null {
  return tiers.find((t) => installments >= t.minInstallments && installments <= t.maxInstallments) ?? null;
}

/** Valor da taxa em reais (totalAmount * feePercent / 100), arredondado a centavos. */
export function computeCardFeeAmount(totalAmount: number, feePercent: number): number {
  return Math.round(totalAmount * feePercent) / 100;
}
