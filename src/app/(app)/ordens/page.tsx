import Link from "next/link";
import { Plus, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { WorkOrderStatusBadge } from "@/components/work-orders/status-badge";
import {
  formatCurrency,
  formatDateTime,
  dayStartInAppTimeZone,
  dayEndExclusiveInAppTimeZone,
  getHourInAppTimeZone,
  PAYMENT_METHOD_LABELS,
  WORK_ORDER_STATUS_LABELS,
} from "@/lib/format";
import { netWorkOrderAmount } from "@/lib/credit-card-fees";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: undefined, label: "Todas" },
  { value: "AGENDADO", label: "Agendadas" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "CONCLUIDO", label: "Concluídas" },
  { value: "CANCELADO", label: "Canceladas" },
] as const;

type SearchParams = {
  status?: string;
  statusNot?: string;
  from?: string;
  to?: string;
  paymentMethod?: string;
  cancellationReasonId?: string;
  service?: string;
  moto?: string;
  hour?: string;
  hasDiscount?: string;
};

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { status, statusNot, from, to, paymentMethod, cancellationReasonId, service, moto, hour, hasDiscount } = sp;

  const [workOrdersRaw, cancellationReason] = await Promise.all([
    prisma.workOrder.findMany({
      where: {
        ...(status ? { status: status as never } : statusNot ? { status: { not: statusNot as never } } : {}),
        ...(from || to
          ? {
              scheduledAt: {
                ...(from ? { gte: dayStartInAppTimeZone(from) } : {}),
                ...(to ? { lt: dayEndExclusiveInAppTimeZone(to) } : {}),
              },
            }
          : {}),
        ...(paymentMethod ? { paymentMethod: paymentMethod as never } : {}),
        ...(cancellationReasonId
          ? { cancellationReasonId: cancellationReasonId === "NONE" ? null : cancellationReasonId }
          : {}),
        ...(service
          ? { services: { some: { OR: [{ service: { name: service } }, { customName: service }] } } }
          : {}),
        ...(moto
          ? {
              motorcycle: {
                OR: [
                  { brand: { contains: moto, mode: "insensitive" } },
                  { model: { contains: moto, mode: "insensitive" } },
                ],
              },
            }
          : {}),
        ...(hasDiscount ? { discount: { gt: 0 } } : {}),
      },
      orderBy: { scheduledAt: "desc" },
      include: {
        client: true,
        motorcycle: true,
        services: { include: { service: true } },
      },
      take: hour !== undefined ? 500 : 100,
    }),
    cancellationReasonId && cancellationReasonId !== "NONE"
      ? prisma.cancellationReason.findUnique({ where: { id: cancellationReasonId } })
      : null,
  ]);

  const workOrders =
    hour !== undefined
      ? workOrdersRaw.filter((wo) => getHourInAppTimeZone(wo.scheduledAt) === Number(hour))
      : workOrdersRaw;

  function buildHref(overrides: Partial<Record<keyof SearchParams, string | undefined>>) {
    const params = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    return params.size > 0 ? `/ordens?${params.toString()}` : "/ordens";
  }

  const chips = [
    paymentMethod && {
      label: `Pagamento: ${PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod}`,
      href: buildHref({ paymentMethod: undefined }),
    },
    cancellationReasonId && {
      label: `Motivo: ${cancellationReasonId === "NONE" ? "Não informado" : (cancellationReason?.name ?? "—")}`,
      href: buildHref({ cancellationReasonId: undefined }),
    },
    service && { label: `Serviço: ${service}`, href: buildHref({ service: undefined }) },
    moto && { label: `Moto: ${moto}`, href: buildHref({ moto: undefined }) },
    hour !== undefined && { label: `Horário: ${hour}h`, href: buildHref({ hour: undefined }) },
    statusNot && {
      label: `Exceto: ${WORK_ORDER_STATUS_LABELS[statusNot] ?? statusNot}`,
      href: buildHref({ statusNot: undefined }),
    },
    hasDiscount && { label: "Com desconto", href: buildHref({ hasDiscount: undefined }) },
  ].filter((c): c is { label: string; href: string } => Boolean(c));

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
          const href = buildHref({ status: filter.value, statusNot: undefined });
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

      {chips.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-pw-blue-300 transition-colors hover:bg-primary/25"
            >
              {chip.label}
              <X className="size-3" />
            </Link>
          ))}
        </div>
      )}

      <form className="mb-5 flex flex-wrap items-end gap-3" action="/ordens">
        {status && <input type="hidden" name="status" value={status} />}
        {statusNot && <input type="hidden" name="statusNot" value={statusNot} />}
        {paymentMethod && <input type="hidden" name="paymentMethod" value={paymentMethod} />}
        {cancellationReasonId && <input type="hidden" name="cancellationReasonId" value={cancellationReasonId} />}
        {service && <input type="hidden" name="service" value={service} />}
        {moto && <input type="hidden" name="moto" value={moto} />}
        {hour !== undefined && <input type="hidden" name="hour" value={hour} />}
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
            <Link href={buildHref({ from: undefined, to: undefined })}>Limpar datas</Link>
          </Button>
        )}
      </form>

      {workOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong p-10 text-center text-muted-foreground">
          {hasDiscount
            ? "Nenhuma OS com desconto concedido neste período."
            : "Nenhuma ordem de serviço encontrada."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {workOrders.map((wo) => {
            const total = Number(wo.totalAmount);
            const net = netWorkOrderAmount(total, wo.paymentMethod, wo.cardFeePercent);
            const hasFee = net !== total;
            return (
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
                  <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
                  {hasFee && (
                    <span className="text-xs text-muted-foreground">líquido: {formatCurrency(net)}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
