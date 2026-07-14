"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleServiceActiveAction } from "@/lib/actions/services";

export function ServiceActiveSwitch({ serviceId, active }: { serviceId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={active}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          try {
            await toggleServiceActiveAction(serviceId, checked);
          } catch {
            toast.error("Não foi possível atualizar.");
          }
        });
      }}
    />
  );
}
