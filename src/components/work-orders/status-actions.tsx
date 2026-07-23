"use client";

import { useTransition } from "react";
import { Loader2, Play, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateWorkOrderStatusAction, reopenWorkOrderAction } from "@/lib/actions/work-orders";

export function StatusActions({
  workOrderId,
  status,
  canReopen = false,
}: {
  workOrderId: string;
  status: string;
  canReopen?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function updateStatus(next: string) {
    startTransition(async () => {
      try {
        await updateWorkOrderStatusAction(workOrderId, next);
        toast.success("Status atualizado.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o status.");
      }
    });
  }

  function reopen() {
    if (!window.confirm("Reabrir esta OS e voltar o status para \"Em andamento\"?")) return;
    startTransition(async () => {
      try {
        await reopenWorkOrderAction(workOrderId);
        toast.success("OS reaberta.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível reabrir a OS.");
      }
    });
  }

  if (status === "CONCLUIDO") {
    if (!canReopen) return null;
    return (
      <Button size="sm" variant="outline" disabled={isPending} onClick={reopen}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
        Reabrir OS
      </Button>
    );
  }

  if (status === "CANCELADO") return null;

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
