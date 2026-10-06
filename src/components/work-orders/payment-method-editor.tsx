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
import { setPaymentMethodAction } from "@/lib/actions/work-orders";
import { PAYMENT_METHOD_LABELS, formatCurrency } from "@/lib/format";
import { computeCardFeeAmount } from "@/lib/credit-card-fees";

export function PaymentMethodEditor({
  workOrderId,
  paymentMethod,
  totalAmount,
  disabled = false,
}: {
  workOrderId: string;
  paymentMethod: string | null;
  totalAmount: number;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={paymentMethod ?? undefined}
      disabled={disabled || isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          const result = await setPaymentMethodAction(workOrderId, value);
          if (result && "error" in result) {
            toast.error(result.error);
            return;
          }
          if (value === "CREDITO" && result.feePercent !== null) {
            const feeAmount = computeCardFeeAmount(totalAmount, result.feePercent);
            toast.warning(
              `Atenção: venda no cartão de crédito à vista aplica taxa de ${result.feePercent.toLocaleString("pt-BR")}% ` +
                `(${formatCurrency(feeAmount)}). Você vai receber ${formatCurrency(totalAmount - feeAmount)} líquidos.`
            );
          } else {
            toast.success("Forma de pagamento atualizada.");
          }
        });
      }}
    >
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue placeholder="Definir forma de pagamento" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DEBITO">{PAYMENT_METHOD_LABELS.DEBITO}</SelectItem>
        <SelectItem value="CREDITO">{PAYMENT_METHOD_LABELS.CREDITO}</SelectItem>
        <SelectItem value="PIX">{PAYMENT_METHOD_LABELS.PIX}</SelectItem>
        <SelectItem value="DINHEIRO">{PAYMENT_METHOD_LABELS.DINHEIRO}</SelectItem>
      </SelectContent>
    </Select>
  );
}
