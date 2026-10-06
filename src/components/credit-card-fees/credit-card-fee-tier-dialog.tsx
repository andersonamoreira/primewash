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
import { CreditCardFeeTierForm } from "@/components/credit-card-fees/credit-card-fee-tier-form";
import {
  createCreditCardFeeTierAction,
  updateCreditCardFeeTierAction,
} from "@/lib/actions/credit-card-fee-tiers";

type CreditCardFeeTierDialogProps = {
  mode: "create" | "edit";
  tier?: { id: string; minInstallments: number; maxInstallments: number; feePercent: string };
};

export function CreditCardFeeTierDialog({ mode, tier }: CreditCardFeeTierDialogProps) {
  const [open, setOpen] = useState(false);

  const action =
    mode === "create" ? createCreditCardFeeTierAction : updateCreditCardFeeTierAction.bind(null, tier!.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="size-4" /> Nova faixa
          </Button>
        ) : (
          <Button size="icon" variant="ghost">
            <Pencil className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nova faixa de parcelamento" : "Editar faixa"}</DialogTitle>
        </DialogHeader>
        <CreditCardFeeTierForm
          action={action}
          defaultValues={tier}
          submitLabel={mode === "create" ? "Criar faixa" : "Salvar alterações"}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
