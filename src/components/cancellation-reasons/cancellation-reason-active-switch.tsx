"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleCancellationReasonActiveAction } from "@/lib/actions/cancellation-reasons";

export function CancellationReasonActiveSwitch({ reasonId, active }: { reasonId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={active}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          const result = await toggleCancellationReasonActiveAction(reasonId, checked);
          if (result && "error" in result) {
            toast.error(result.error);
          }
        });
      }}
    />
  );
}
