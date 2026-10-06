"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { setCreditCardInstallmentsAction } from "@/lib/actions/work-orders";
import { formatCurrency } from "@/lib/format";
import { findFeeTierForInstallments, computeCardFeeAmount } from "@/lib/credit-card-fees";

type Tier = { id: string; minInstallments: number; maxInstallments: number; feePercent: number };

export function CreditCardInstallmentsEditor({
  workOrderId,
  totalAmount,
  installments,
  cardFeePercent,
  tiers,
  disabled = false,
}: {
  workOrderId: string;
  totalAmount: number;
  installments: number | null;
  cardFeePercent: number | null;
  tiers: Tier[];
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const options = Array.from({ length: 12 }, (_, i) => i + 1)
    .map((n) => ({ n, tier: findFeeTierForInstallments(tiers, n) }))
    .filter((o): o is { n: number; tier: Tier } => o.tier !== null);

  const feeAmount = cardFeePercent !== null ? computeCardFeeAmount(totalAmount, cardFeePercent) : null;

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={installments ? String(installments) : undefined}
        disabled={disabled || isPending}
        onValueChange={(value) => {
          const next = Number(value);
          startTransition(async () => {
            const result = await setCreditCardInstallmentsAction(workOrderId, next);
            if (result && "error" in result) {
              toast.error(result.error);
              return;
            }
            const amount = computeCardFeeAmount(totalAmount, result.feePercent);
            toast.warning(
              `Atenção: venda em ${result.installments}x no cartão de crédito aplica taxa de ` +
                `${result.feePercent.toLocaleString("pt-BR")}% (${formatCurrency(amount)}). ` +
                `Você vai receber ${formatCurrency(totalAmount - amount)} líquidos.`
            );
          });
        }}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Selecione o parcelamento" />
        </SelectTrigger>
        <SelectContent>
          {options.map(({ n, tier }) => (
            <SelectItem key={n} value={String(n)}>
              {n === 1 ? "À vista (1x)" : `${n}x`} — {Number(tier.feePercent).toLocaleString("pt-BR")}%
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {feeAmount !== null && (
        <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Valor cheio</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>
              Taxa da operadora ({cardFeePercent!.toLocaleString("pt-BR")}% em {installments}x)
            </span>
            <span>- {formatCurrency(feeAmount)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-warning/30 pt-1 font-semibold text-foreground">
            <span>Valor líquido a receber</span>
            <span>{formatCurrency(totalAmount - feeAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
