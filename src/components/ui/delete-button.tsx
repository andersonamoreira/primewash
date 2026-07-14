"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DeleteButton({
  action,
  confirmMessage = "Tem certeza que deseja excluir?",
  redirectTo,
  label,
  className,
}: {
  action: () => Promise<unknown>;
  confirmMessage?: string;
  redirectTo?: string;
  label?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size={label ? "sm" : "icon"}
      disabled={isPending}
      className={cn("text-danger hover:bg-danger/10 hover:text-danger", className)}
      onClick={() => {
        if (typeof window !== "undefined" && !window.confirm(confirmMessage)) return;
        startTransition(async () => {
          try {
            await action();
            if (redirectTo) router.push(redirectTo);
          } catch {
            toast.error("Não foi possível excluir.");
          }
        });
      }}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      {label}
    </Button>
  );
}
