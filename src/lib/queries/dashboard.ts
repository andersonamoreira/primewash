import { startOfMonth, endOfMonth, startOfDay, format } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function getDashboardData(reference: Date = new Date()) {
  const monthStart = startOfMonth(reference);
  const monthEnd = endOfMonth(reference);

  const [monthOrders, upcomingCount, allTimeClients] = await Promise.all([
    prisma.workOrder.findMany({
      where: { scheduledAt: { gte: monthStart, lte: monthEnd } },
      include: {
        motorcycle: true,
        services: { include: { service: true } },
      },
    }),
    prisma.workOrder.count({
      where: { status: "AGENDADO", scheduledAt: { gte: new Date() } },
    }),
    prisma.client.count(),
  ]);

  const activeOrders = monthOrders.filter((wo) => wo.status !== "CANCELADO");
  const completedOrders = monthOrders.filter((wo) => wo.status === "CONCLUIDO");

  const revenueThisMonth = completedOrders.reduce((sum, wo) => sum + Number(wo.totalAmount), 0);

  const brandCounts = new Map<string, number>();
  for (const wo of activeOrders) {
    const key = `${wo.motorcycle.brand} ${wo.motorcycle.model}`;
    brandCounts.set(key, (brandCounts.get(key) ?? 0) + 1);
  }
  const motosByBrand = Array.from(brandCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const serviceCounts = new Map<string, number>();
  for (const wo of activeOrders) {
    for (const line of wo.services) {
      serviceCounts.set(line.service.name, (serviceCounts.get(line.service.name) ?? 0) + 1);
    }
  }
  const topServices = Array.from(serviceCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const hourCounts = new Map<number, number>();
  for (const wo of activeOrders) {
    const hour = wo.scheduledAt.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  }
  const byHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, "0")}h`,
    count: hourCounts.get(hour) ?? 0,
  })).filter((h) => h.count > 0 || (h.hour >= 7 && h.hour <= 19));

  const paymentTotals = { DEBITO: 0, CREDITO: 0, PIX: 0 };
  for (const wo of completedOrders) {
    if (wo.paymentMethod) {
      paymentTotals[wo.paymentMethod] += Number(wo.totalAmount);
    }
  }

  const dailyRevenue = new Map<string, number>();
  for (const wo of completedOrders) {
    const key = format(wo.finishedAt ?? wo.scheduledAt, "dd/MM");
    dailyRevenue.set(key, (dailyRevenue.get(key) ?? 0) + Number(wo.totalAmount));
  }
  const revenueSeries: { date: string; total: number }[] = [];
  const cursor = startOfDay(monthStart);
  const today = startOfDay(new Date());
  const lastDay = monthEnd < today ? monthEnd : today;
  for (let d = new Date(cursor); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const key = format(d, "dd/MM");
    revenueSeries.push({ date: key, total: dailyRevenue.get(key) ?? 0 });
  }

  return {
    stats: {
      motosRecebidas: activeOrders.length,
      revenueThisMonth,
      upcomingCount,
      totalClients: allTimeClients,
    },
    motosByBrand,
    topServices,
    byHour,
    paymentTotals,
    revenueSeries,
  };
}

export type DashboardData = ReturnType<typeof getDashboardData> extends Promise<infer T> ? T : never;
