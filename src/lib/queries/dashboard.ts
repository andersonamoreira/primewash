import { prisma } from "@/lib/prisma";
import { monthBoundsInAppTimeZone, getHourInAppTimeZone, formatDayKeyInAppTimeZone } from "@/lib/format";
import { netWorkOrderAmount } from "@/lib/credit-card-fees";

export async function getDashboardData(reference: Date = new Date()) {
  const { start: monthStart, end: monthEnd, year, month, daysInMonth, today } = monthBoundsInAppTimeZone(reference);
  const pad = (n: number) => String(n).padStart(2, "0");
  const monthRange = { from: `${year}-${pad(month)}-01`, to: `${year}-${pad(month)}-${pad(daysInMonth)}` };

  const [monthOrders, upcomingCount, allTimeClients] = await Promise.all([
    prisma.workOrder.findMany({
      where: { scheduledAt: { gte: monthStart, lt: monthEnd } },
      include: {
        motorcycle: true,
        services: { include: { service: true } },
      },
    }),
    prisma.workOrder.count({
      where: { status: "AGENDADO" },
    }),
    prisma.client.count(),
  ]);

  const activeOrders = monthOrders.filter((wo) => wo.status !== "CANCELADO");
  const completedOrders = monthOrders.filter((wo) => wo.status === "CONCLUIDO");

  const revenueThisMonth = completedOrders.reduce(
    (sum, wo) => sum + netWorkOrderAmount(Number(wo.totalAmount), wo.paymentMethod, wo.cardFeePercent),
    0
  );

  const brandCounts = new Map<string, { brand: string; model: string; count: number }>();
  for (const wo of activeOrders) {
    const key = `${wo.motorcycle.brand} ${wo.motorcycle.model}`;
    const entry = brandCounts.get(key) ?? { brand: wo.motorcycle.brand, model: wo.motorcycle.model, count: 0 };
    entry.count += 1;
    brandCounts.set(key, entry);
  }
  const motosByBrand = Array.from(brandCounts.entries())
    .map(([name, { brand, model, count }]) => ({ name, brand, model, count }))
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

  const paymentTotals = { DEBITO: 0, CREDITO: 0, PIX: 0, DINHEIRO: 0 };
  for (const wo of completedOrders) {
    if (wo.paymentMethod) {
      paymentTotals[wo.paymentMethod] += netWorkOrderAmount(Number(wo.totalAmount), wo.paymentMethod, wo.cardFeePercent);
    }
  }

  const dailyRevenue = new Map<string, number>();
  for (const wo of completedOrders) {
    const key = formatDayKeyInAppTimeZone(wo.finishedAt ?? wo.scheduledAt);
    const net = netWorkOrderAmount(Number(wo.totalAmount), wo.paymentMethod, wo.cardFeePercent);
    dailyRevenue.set(key, (dailyRevenue.get(key) ?? 0) + net);
  }

  const lastDay = Math.min(daysInMonth, today);
  const revenueSeries: { date: string; dateISO: string; total: number }[] = [];
  for (let day = 1; day <= lastDay; day++) {
    const key = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
    revenueSeries.push({
      date: key,
      dateISO: `${year}-${pad(month)}-${pad(day)}`,
      total: dailyRevenue.get(key) ?? 0,
    });
  }

  return {
    stats: {
      motosRecebidas: activeOrders.length,
      revenueThisMonth,
      upcomingCount,
      totalClients: allTimeClients,
    },
    monthRange,
    motosByBrand,
    topServices,
    byHour,
    paymentTotals,
    revenueSeries,
  };
}

export type DashboardData = ReturnType<typeof getDashboardData> extends Promise<infer T> ? T : never;
