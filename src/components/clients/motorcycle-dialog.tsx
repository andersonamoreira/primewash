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
import { MotorcycleForm } from "@/components/clients/motorcycle-form";
import { createMotorcycleAction, updateMotorcycleAction } from "@/lib/actions/clients";

type MotorcycleDialogProps = {
  clientId: string;
  mode: "create" | "edit";
  motorcycle?: {
    id: string;
    brand: string;
    model: string;
    color: string;
    plate: string;
    cylinderTier: string;
    notes: string | null;
  };
};

export function MotorcycleDialog({ clientId, mode, motorcycle }: MotorcycleDialogProps) {
  const [open, setOpen] = useState(false);

  const action =
    mode === "create"
      ? createMotorcycleAction
      : updateMotorcycleAction.bind(null, motorcycle!.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm" variant="secondary">
            <Plus className="size-4" /> Adicionar moto
          </Button>
        ) : (
          <Button size="icon" variant="ghost">
            <Pencil className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Adicionar moto" : "Editar moto"}</DialogTitle>
        </DialogHeader>
        <MotorcycleForm
          clientId={clientId}
          action={action}
          defaultValues={motorcycle}
          submitLabel={mode === "create" ? "Adicionar moto" : "Salvar alterações"}
        />
      </DialogContent>
    </Dialog>
  );
}
