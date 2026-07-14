"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { CpfInput } from "@/components/ui/cpf-input";
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
import { BRAZILIAN_STATES } from "@/lib/brazilian-states";
import { REFERRAL_SOURCES } from "@/lib/validations/client";
import { REFERRAL_SOURCE_LABELS } from "@/lib/format";

type ClientFormProps = {
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
  defaultValues?: {
    name?: string;
    phone?: string;
    email?: string | null;
    document?: string | null;
    city?: string | null;
    state?: string | null;
    referralSource?: string | null;
    notes?: string | null;
  };
  submitLabel?: string;
};

export function ClientForm({ action, defaultValues, submitLabel = "Salvar cliente" }: ClientFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} placeholder="Nome completo" required />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Telefone / WhatsApp *</Label>
          <PhoneInput id="phone" name="phone" defaultValue={defaultValues?.phone} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="document">CPF</Label>
          <CpfInput id="document" name="document" defaultValue={defaultValues?.document ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" name="city" defaultValue={defaultValues?.city ?? ""} placeholder="Opcional" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">UF</Label>
          <Select name="state" defaultValue={defaultValues?.state ?? ""}>
            <SelectTrigger id="state" className="sm:w-28">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {BRAZILIAN_STATES.map((s) => (
                <SelectItem key={s.uf} value={s.uf}>
                  {s.uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultValues?.email ?? ""}
            placeholder="Opcional"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="referralSource">Como conheceu nossa loja?</Label>
          <Select name="referralSource" defaultValue={defaultValues?.referralSource ?? ""}>
            <SelectTrigger id="referralSource">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {REFERRAL_SOURCES.map((source) => (
                <SelectItem key={source} value={source}>
                  {REFERRAL_SOURCE_LABELS[source]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          placeholder="Preferências, alergias a produtos, observações gerais..."
          className="min-h-16"
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
