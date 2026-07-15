import { prisma } from "@/lib/prisma";
import { monthBoundsInAppTimeZone, getHourInAppTimeZone, formatDayKeyInAppTimeZone } from "@/lib/format";

export async function getDashboardData(reference: Date = new Date()) {
  const { start: monthStart, end: monthEnd, month, daysInMonth, today } = monthBoundsInAppTimeZone(reference);

  const [monthOrders, upcomingCount, allTimeClients] = await Promise.all([
    prisma.workOrder.findMany({
      where: { scheduledAt: { gte: monthStart, lt: monthEnd } },
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
      if (!line.service) continue;
      serviceCounts.set(line.service.name, (serviceCounts.get(line.service.name) ?? 0) + 1);
    }
  }
  const topServices = Array.from(serviceCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const hourCounts = new Map<number, number>();
  for (const wo of activeOrders) {
    const hour = getHourInAppTimeZone(wo.scheduledAt);
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
    const key = formatDayKeyInAppTimeZone(wo.finishedAt ?? wo.scheduledAt);
    dailyRevenue.set(key, (dailyRevenue.get(key) ?? 0) + Number(wo.totalAmount));
  }

  const lastDay = Math.min(daysInMonth, today);
  const revenueSeries: { date: string; total: number }[] = [];
  for (let day = 1; day <= lastDay; day++) {
    const key = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
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
