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

/** Valor líquido efetivamente recebido pela loja: igual ao total, exceto em OS pagas no
 * cartão de crédito, onde desconta a taxa da operadora travada na própria OS. Usado nos
 * números de faturamento internos — o cliente sempre vê e paga o valor cheio. */
export function netWorkOrderAmount(
  totalAmount: number,
  paymentMethod: string | null,
  cardFeePercent: number | string | { toString(): string } | null
): number {
  if (paymentMethod !== "CREDITO" || cardFeePercent === null || cardFeePercent === undefined) {
    return totalAmount;
  }
  return totalAmount - computeCardFeeAmount(totalAmount, Number(cardFeePercent));
}
