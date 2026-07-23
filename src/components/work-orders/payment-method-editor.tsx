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
import { PAYMENT_METHOD_LABELS } from "@/lib/format";

export function PaymentMethodEditor({
  workOrderId,
  paymentMethod,
}: {
  workOrderId: string;
  paymentMethod: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={paymentMethod ?? undefined}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          try {
            await setPaymentMethodAction(workOrderId, value);
            toast.success("Forma de pagamento atualizada.");
          } catch {
            toast.error("Não foi possível atualizar.");
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
