import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { WorkOrderStatusBadge } from "@/components/work-orders/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: undefined, label: "Todas" },
  { value: "AGENDADO", label: "Agendadas" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "CONCLUIDO", label: "Concluídas" },
  { value: "CANCELADO", label: "Canceladas" },
] as const;

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const workOrders = await prisma.workOrder.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { scheduledAt: "desc" },
    include: {
      client: true,
      motorcycle: true,
      services: { include: { service: true } },
    },
    take: 100,
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground">{workOrders.length} ordem(ns)</p>
        </div>
        <Button asChild>
          <Link href="/ordens/novo">
            <Plus className="size-4" /> Nova OS
          </Link>
        </Button>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => {
          const isActive = (filter.value ?? "") === (status ?? "");
          const href = filter.value ? `/ordens?status=${filter.value}` : "/ordens";
          return (
            <Link
              key={filter.label}
              href={href}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-raised text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {workOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong p-10 text-center text-muted-foreground">
          Nenhuma ordem de serviço encontrada.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {workOrders.map((wo) => (
            <Link
              key={wo.id}
              href={`/ordens/${wo.id}`}
              className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">
                  OS #{wo.number} · {wo.client.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {wo.motorcycle.brand} {wo.motorcycle.model} ({wo.motorcycle.plate}) ·{" "}
                  {wo.services.map((s) => (s.service?.name ?? s.customName)).join(", ") || "Sem serviços"}
                </p>
                <p className="text-xs text-muted-foreground">{formatDateTime(wo.scheduledAt)}</p>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                <WorkOrderStatusBadge status={wo.status} />
                <span className="font-semibold text-foreground">
                  {formatCurrency(wo.totalAmount.toString())}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
