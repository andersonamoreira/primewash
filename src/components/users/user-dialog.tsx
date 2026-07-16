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
import { UserForm } from "@/components/users/user-form";
import { createUserAction, updateUserAction } from "@/lib/actions/users";

type UserDialogProps = {
  mode: "create" | "edit";
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    canReopenWorkOrder: boolean;
  };
};

export function UserDialog({ mode, user }: UserDialogProps) {
  const [open, setOpen] = useState(false);

  const action = mode === "create" ? createUserAction : updateUserAction.bind(null, user!.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="size-4" /> Novo usuário
          </Button>
        ) : (
          <Button size="icon" variant="ghost">
            <Pencil className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo usuário" : "Editar usuário"}</DialogTitle>
        </DialogHeader>
        <UserForm
          action={action}
          defaultValues={user}
          isEdit={mode === "edit"}
          submitLabel={mode === "create" ? "Criar usuário" : "Salvar alterações"}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
