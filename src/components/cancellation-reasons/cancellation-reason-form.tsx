"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CancellationReasonFormProps = {
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
  defaultValues?: { name?: string };
  submitLabel?: string;
  onSuccess?: () => void;
};

export function CancellationReasonForm({
  action,
  defaultValues,
  submitLabel = "Salvar",
  onSuccess,
}: CancellationReasonFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !error) onSuccess?.();
    wasPending.current = isPending;
  }, [isPending, error, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome do motivo *</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} placeholder="Ex: Chuva" required />
      </div>

      {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={isPending} className="mt-1 self-start">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
