import { Badge } from "@/components/ui/badge";
import { WORK_ORDER_STATUS_LABELS } from "@/lib/format";

const VARIANT_MAP: Record<string, "default" | "success" | "warning" | "danger" | "secondary"> = {
  AGENDADO: "warning",
  EM_ANDAMENTO: "default",
  CONCLUIDO: "success",
  CANCELADO: "danger",
};

export function WorkOrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={VARIANT_MAP[status] ?? "secondary"}>
      {WORK_ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
