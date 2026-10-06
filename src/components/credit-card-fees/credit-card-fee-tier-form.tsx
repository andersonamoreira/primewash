"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CreditCardFeeTierFormProps = {
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
  defaultValues?: { minInstallments?: number; maxInstallments?: number; feePercent?: string };
  submitLabel?: string;
  onSuccess?: () => void;
};

export function CreditCardFeeTierForm({
  action,
  defaultValues,
  submitLabel = "Salvar",
  onSuccess,
}: CreditCardFeeTierFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !error) onSuccess?.();
    wasPending.current = isPending;
  }, [isPending, error, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="minInstallments">De (parcela) *</Label>
          <Input
            id="minInstallments"
            name="minInstallments"
            type="number"
            min={1}
            max={12}
            defaultValue={defaultValues?.minInstallments}
            placeholder="1"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxInstallments">Até (parcela) *</Label>
          <Input
            id="maxInstallments"
            name="maxInstallments"
            type="number"
            min={1}
            max={12}
            defaultValue={defaultValues?.maxInstallments}
            placeholder="1"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feePercent">Taxa (%) *</Label>
        <Input
          id="feePercent"
          name="feePercent"
          inputMode="decimal"
          defaultValue={defaultValues?.feePercent}
          placeholder="4,98"
          required
        />
      </div>

      {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={isPending} className="mt-1 self-start">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
