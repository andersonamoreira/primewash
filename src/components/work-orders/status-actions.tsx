"use client";

import { useTransition } from "react";
import { Loader2, Play, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateWorkOrderStatusAction } from "@/lib/actions/work-orders";

export function StatusActions({ workOrderId, status }: { workOrderId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  function updateStatus(next: string) {
    startTransition(async () => {
      try {
        await updateWorkOrderStatusAction(workOrderId, next);
        toast.success("Status atualizado.");
      } catch {
        toast.error("Não foi possível atualizar o status.");
      }
    });
  }

  if (status === "CONCLUIDO" || status === "CANCELADO") return null;

  return (
    <div className="flex flex-wrap gap-2">
      {status === "AGENDADO" && (
        <Button size="sm" disabled={isPending} onClick={() => updateStatus("EM_ANDAMENTO")}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          Iniciar atendimento
        </Button>
      )}
      {status === "EM_ANDAMENTO" && (
        <Button size="sm" disabled={isPending} onClick={() => updateStatus("CONCLUIDO")}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          Concluir
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        className="text-danger hover:bg-danger/10"
        onClick={() => updateStatus("CANCELADO")}
      >
        <XCircle className="size-4" />
        Cancelar
      </Button>
    </div>
  );
}
