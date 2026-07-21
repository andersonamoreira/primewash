import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { WorkOrderStatusBadge } from "@/components/work-orders/status-badge";
import {
  formatCurrency,
  formatDateTime,
  dayStartInAppTimeZone,
  dayEndExclusiveInAppTimeZone,
} from "@/lib/format";
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
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const { status, from, to } = await searchParams;

  const workOrders = await prisma.workOrder.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(from || to
        ? {
            scheduledAt: {
              ...(from ? { gte: dayStartInAppTimeZone(from) } : {}),
              ...(to ? { lt: dayEndExclusiveInAppTimeZone(to) } : {}),
            },
          }
        : {}),
    },
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

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => {
          const isActive = (filter.value ?? "") === (status ?? "");
          const params = new URLSearchParams();
          if (filter.value) params.set("status", filter.value);
          if (from) params.set("from", from);
          if (to) params.set("to", to);
          const href = params.size > 0 ? `/ordens?${params.toString()}` : "/ordens";
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

      <form className="mb-5 flex flex-wrap items-end gap-3" action="/ordens">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-xs font-medium text-muted-foreground">
            De
          </label>
          <input
            id="from"
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-xs font-medium text-muted-foreground">
            Até
          </label>
          <input
            id="to"
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-foreground"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Filtrar
        </Button>
        {(from || to) && (
          <Button asChild type="button" variant="ghost" size="sm">
            <Link href={status ? `/ordens?status=${status}` : "/ordens"}>Limpar datas</Link>
          </Button>
        )}
      </form>

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
                  {wo.motorcycle.brand} {wo.motorcycle.model}
                  {wo.motorcycle.plate ? ` (${wo.motorcycle.plate})` : ""} ·{" "}
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
