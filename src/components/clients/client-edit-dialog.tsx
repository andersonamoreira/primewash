"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/clients/client-form";
import { updateClientAction } from "@/lib/actions/clients";

export function ClientEditDialog({
  client,
}: {
  client: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    document: string | null;
    city: string | null;
    state: string | null;
    referralSource: string | null;
    notes: string | null;
  };
}) {
  const [open, setOpen] = useState(false);
  const action = updateClientAction.bind(null, client.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Pencil className="size-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
        </DialogHeader>
        <ClientForm action={action} defaultValues={client} submitLabel="Salvar alterações" />
      </DialogContent>
    </Dialog>
  );
}
