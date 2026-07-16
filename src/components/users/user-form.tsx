"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ROLES } from "@/lib/validations/user";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  USER: "Usuário comum",
};

type UserFormProps = {
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
  defaultValues?: {
    name?: string;
    email?: string;
    role?: string;
    canReopenWorkOrder?: boolean;
  };
  isEdit?: boolean;
  submitLabel?: string;
  onSuccess?: () => void;
};

export function UserForm({
  action,
  defaultValues,
  isEdit,
  submitLabel = "Salvar",
  onSuccess,
}: UserFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const wasPending = useRef(false);
  const [role, setRole] = useState(defaultValues?.role ?? "USER");

  useEffect(() => {
    if (wasPending.current && !isPending && !error) {
      onSuccess?.();
    }
    wasPending.current = isPending;
  }, [isPending, error, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail *</Label>
        <Input id="email" name="email" type="email" defaultValue={defaultValues?.email} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{isEdit ? "Nova senha" : "Senha *"}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={isEdit ? "Deixe em branco para manter a atual" : undefined}
          required={!isEdit}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role">Perfil de acesso *</Label>
        <Select name="role" value={role} onValueChange={setRole}>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Usuário comum não pode excluir registros; pode editar OS não iniciada/em andamento e
          cadastro de clientes.
        </p>
      </div>

      {role === "USER" && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-raised px-3 py-2.5">
          <div>
            <Label htmlFor="canReopenWorkOrder">Pode reabrir OS concluídas</Label>
            <p className="text-xs text-muted-foreground">
              Administradores sempre podem reabrir; aqui você libera isso para este usuário comum.
            </p>
          </div>
          <Switch
            id="canReopenWorkOrder"
            name="canReopenWorkOrder"
            defaultChecked={defaultValues?.canReopenWorkOrder}
          />
        </div>
      )}

      {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={isPending} className="mt-1 self-start">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
