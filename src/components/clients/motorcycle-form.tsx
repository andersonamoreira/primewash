"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CYLINDER_TIER_LABELS } from "@/lib/format";
import { CYLINDER_TIERS } from "@/lib/validations/client";
import { MOTORCYCLE_BRANDS } from "@/lib/motorcycle-brands";

type MotorcycleFormProps = {
  clientId: string;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
  defaultValues?: {
    brand?: string;
    model?: string;
    color?: string;
    plate?: string | null;
    cylinderTier?: string;
    notes?: string | null;
  };
  submitLabel?: string;
  onSuccess?: () => void;
};

const KNOWN_BRANDS: readonly string[] = MOTORCYCLE_BRANDS;

export function MotorcycleForm({
  clientId,
  action,
  defaultValues,
  submitLabel = "Salvar moto",
}: MotorcycleFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);

  const [brandOption, setBrandOption] = useState(() => {
    const b = defaultValues?.brand;
    if (!b) return "";
    return KNOWN_BRANDS.includes(b) ? b : "Outra";
  });
  const [customBrand, setCustomBrand] = useState(() => {
    const b = defaultValues?.brand;
    if (!b || KNOWN_BRANDS.includes(b)) return "";
    return b;
  });

  const finalBrand = brandOption === "Outra" ? customBrand : brandOption;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="brand" value={finalBrand} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="brand">Marca *</Label>
          <Select value={brandOption} onValueChange={setBrandOption}>
            <SelectTrigger id="brand">
              <SelectValue placeholder="Selecione a marca" />
            </SelectTrigger>
            <SelectContent>
              {MOTORCYCLE_BRANDS.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="model">Modelo *</Label>
          <Input id="model" name="model" defaultValue={defaultValues?.model} placeholder="CB 500" required />
        </div>
      </div>

      {brandOption === "Outra" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="customBrand">Qual marca? *</Label>
          <Input
            id="customBrand"
            value={customBrand}
            onChange={(e) => setCustomBrand(e.target.value)}
            placeholder="Digite a marca"
            required
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="color">Cor *</Label>
          <Input id="color" name="color" defaultValue={defaultValues?.color} placeholder="Preta" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="plate">Placa</Label>
          <Input
            id="plate"
            name="plate"
            defaultValue={defaultValues?.plate ?? ""}
            placeholder="ABC1D23"
            className="uppercase"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cylinderTier">Categoria de cilindrada *</Label>
        <Select name="cylinderTier" defaultValue={defaultValues?.cylinderTier ?? "MEDIA"}>
          <SelectTrigger id="cylinderTier">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CYLINDER_TIERS.map((tier) => (
              <SelectItem key={tier} value={tier}>
                {CYLINDER_TIER_LABELS[tier]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="motoNotes">Observações</Label>
        <Textarea
          id="motoNotes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          placeholder="Avarias pré-existentes, acessórios, observações gerais..."
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
