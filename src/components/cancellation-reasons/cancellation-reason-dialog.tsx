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
import { CancellationReasonForm } from "@/components/cancellation-reasons/cancellation-reason-form";
import {
  createCancellationReasonAction,
  updateCancellationReasonAction,
} from "@/lib/actions/cancellation-reasons";

type CancellationReasonDialogProps = {
  mode: "create" | "edit";
  reason?: { id: string; name: string };
};

export function CancellationReasonDialog({ mode, reason }: CancellationReasonDialogProps) {
  const [open, setOpen] = useState(false);

  const action =
    mode === "create" ? createCancellationReasonAction : updateCancellationReasonAction.bind(null, reason!.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="size-4" /> Novo motivo
          </Button>
        ) : (
          <Button size="icon" variant="ghost">
            <Pencil className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo motivo de cancelamento" : "Editar motivo"}</DialogTitle>
        </DialogHeader>
        <CancellationReasonForm
          action={action}
          defaultValues={reason ? { name: reason.name } : undefined}
          submitLabel={mode === "create" ? "Criar motivo" : "Salvar alterações"}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
