"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleUserActiveAction } from "@/lib/actions/users";

export function ToggleActiveSwitch({ userId, active }: { userId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={active}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          try {
            await toggleUserActiveAction(userId, checked);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível atualizar.");
          }
        });
      }}
    />
  );
}
