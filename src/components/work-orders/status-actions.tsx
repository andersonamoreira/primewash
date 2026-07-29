"use client";

import { useState, useTransition } from "react";
import { Loader2, Play, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { updateWorkOrderStatusAction, reopenWorkOrderAction } from "@/lib/actions/work-orders";
import { CANCELLATION_REASONS, CANCELLATION_REASON_LABELS } from "@/lib/format";

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
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  function updateStatus(next: string) {
    startTransition(async () => {
      const result = await updateWorkOrderStatusAction(workOrderId, next);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Status atualizado.");
    });
  }

  function confirmCancel() {
    if (!cancellationReason) {
      toast.error("Selecione o motivo do cancelamento.");
      return;
    }
    startTransition(async () => {
      const result = await updateWorkOrderStatusAction(workOrderId, "CANCELADO", cancellationReason);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("OS cancelada.");
      setCancelOpen(false);
      setCancellationReason("");
    });
  }

  function reopen() {
    if (!window.confirm("Reabrir esta OS e voltar o status para \"Em andamento\"?")) return;
    startTransition(async () => {
      const result = await reopenWorkOrderAction(workOrderId);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("OS reaberta.");
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
        onClick={() => setCancelOpen(true)}
      >
        <XCircle className="size-4" />
        Cancelar
      </Button>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar OS</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Motivo do cancelamento *</label>
              <Select value={cancellationReason} onValueChange={setCancellationReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  {CANCELLATION_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {CANCELLATION_REASON_LABELS[reason]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" disabled={isPending} onClick={() => setCancelOpen(false)}>
                Voltar
              </Button>
              <Button
                disabled={isPending}
                className="bg-danger text-white hover:brightness-110"
                onClick={confirmCancel}
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Confirmar cancelamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
