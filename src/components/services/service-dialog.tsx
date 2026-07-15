"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "@/components/services/service-form";
import { createServiceAction, updateServiceAction } from "@/lib/actions/services";

type ServiceDialogProps = {
  mode: "create" | "edit";
  groups: { id: string; name: string }[];
  service?: {
    id: string;
    name: string;
    description: string | null;
    groupId: string | null;
    prices: { tier: string; price: string }[];
  };
};

export function ServiceDialog({ mode, groups, service }: ServiceDialogProps) {
  const [open, setOpen] = useState(false);

  const action =
    mode === "create" ? createServiceAction : updateServiceAction.bind(null, service!.id);

  const defaultValues = service
    ? {
        name: service.name,
        description: service.description,
        groupId: service.groupId,
        priceBaixa: service.prices.find((p) => p.tier === "BAIXA")?.price,
        priceMedia: service.prices.find((p) => p.tier === "MEDIA")?.price,
        priceAlta: service.prices.find((p) => p.tier === "ALTA")?.price,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="size-4" /> Novo serviço
          </Button>
        ) : (
          <Button size="icon" variant="ghost">
            <Pencil className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo serviço" : "Editar serviço"}</DialogTitle>
        </DialogHeader>
        <ServiceForm
          action={action}
          groups={groups}
          defaultValues={defaultValues}
          submitLabel={mode === "create" ? "Criar serviço" : "Salvar alterações"}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
