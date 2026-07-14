"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type ServiceFormProps = {
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
  defaultValues?: {
    name?: string;
    description?: string | null;
    priceBaixa?: string;
    priceMedia?: string;
    priceAlta?: string;
  };
  submitLabel?: string;
  onSuccess?: () => void;
};

export function ServiceForm({ action, defaultValues, submitLabel = "Salvar", onSuccess }: ServiceFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !error) onSuccess?.();
    wasPending.current = isPending;
  }, [isPending, error, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome do serviço *</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} placeholder="Ex: Super Prime" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          placeholder="O que está incluso nesse pacote"
        />
      </div>

      <div>
        <Label className="mb-2 block">Preços por categoria de cilindrada *</Label>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="priceBaixa" className="text-xs text-muted-foreground">
              Baixa
            </Label>
            <Input
              id="priceBaixa"
              name="priceBaixa"
              inputMode="decimal"
              defaultValue={defaultValues?.priceBaixa}
              placeholder="0,00"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="priceMedia" className="text-xs text-muted-foreground">
              Média
            </Label>
            <Input
              id="priceMedia"
              name="priceMedia"
              inputMode="decimal"
              defaultValue={defaultValues?.priceMedia}
              placeholder="0,00"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="priceAlta" className="text-xs text-muted-foreground">
              Alta
            </Label>
            <Input
              id="priceAlta"
              name="priceAlta"
              inputMode="decimal"
              defaultValue={defaultValues?.priceAlta}
              placeholder="0,00"
              required
            />
          </div>
        </div>
      </div>

      {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={isPending} className="mt-1 self-start">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
