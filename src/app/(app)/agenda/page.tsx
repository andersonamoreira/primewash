import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Bike, PackageCheck } from "lucide-react";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  addDays,
  isSameDay,
  format,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { WorkOrderStatusBadge } from "@/components/work-orders/status-badge";
import { formatCurrency, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

function toDateParam(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const selectedDate = date ? parseISO(date) : new Date();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const [weekOrders, dayOrders] = await Promise.all([
    prisma.workOrder.findMany({
      where: {
        scheduledAt: { gte: startOfDay(weekStart), lte: endOfDay(addDays(weekStart, 6)) },
        status: { not: "CANCELADO" },
      },
      select: { scheduledAt: true },
    }),
    prisma.workOrder.findMany({
      where: {
        scheduledAt: { gte: startOfDay(selectedDate), lte: endOfDay(selectedDate) },
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        client: true,
        motorcycle: true,
        services: { include: { service: true } },
      },
    }),
  ]);

  const countsByDay = new Map<string, number>();
  for (const wo of weekOrders) {
    const key = toDateParam(wo.scheduledAt);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const prevWeek = toDateParam(addDays(weekStart, -7));
  const nextWeek = toDateParam(addDays(weekStart, 7));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/ordens/novo">
            <Plus className="size-4" /> Agendar
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-1">
        <Link href={`/agenda?date=${prevWeek}`} className="rounded-md p-2 text-muted-foreground hover:bg-surface-raised">
          <ChevronLeft className="size-4" />
        </Link>
        <div className="grid flex-1 grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const key = toDateParam(day);
            const isSelected = isSameDay(day, selectedDate);
            const count = countsByDay.get(key) ?? 0;
            return (
              <Link
                key={key}
                href={`/agenda?date=${key}`}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "hover:bg-surface-raised"
                )}
              >
                <span className={cn("text-[11px] uppercase", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {format(day, "EEEEE", { locale: ptBR })}
                </span>
                <span className="text-sm font-semibold">{format(day, "d")}</span>
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    count > 0 ? (isSelected ? "bg-primary-foreground" : "bg-primary") : "bg-transparent"
                  )}
                />
              </Link>
            );
          })}
        </div>
        <Link href={`/agenda?date=${nextWeek}`} className="rounded-md p-2 text-muted-foreground hover:bg-surface-raised">
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {dayOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong p-10 text-center text-muted-foreground">
          Nenhum serviço agendado para este dia.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {dayOrders.map((wo) => (
            <Link
              key={wo.id}
              href={`/ordens/${wo.id}`}
              className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface p-3.5 transition-colors hover:border-primary/40"
            >
              <div className="flex flex-col items-center rounded-md bg-surface-raised px-2.5 py-1.5">
                <span className="text-sm font-bold text-foreground">{formatTime(wo.scheduledAt)}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{wo.client.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bike className="size-3.5" /> {wo.motorcycle.brand} {wo.motorcycle.model} ·{" "}
                  {wo.services.map((s) => s.service.name).join(", ") || "Sem serviços"}
                </p>
                {wo.estimatedDeliveryAt && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <PackageCheck className="size-3.5" /> Entrega prevista: {formatTime(wo.estimatedDeliveryAt)}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <WorkOrderStatusBadge status={wo.status} />
                <span className="text-sm font-semibold text-foreground">
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
