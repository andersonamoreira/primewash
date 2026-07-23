import { prisma } from "@/lib/prisma";
import { REFERRAL_SOURCE_LABELS } from "@/lib/format";

export type DateRange = { gte: Date; lt: Date };

export async function getSalesReport({ gte, lt }: DateRange) {
  const workOrders = await prisma.workOrder.findMany({
    where: { scheduledAt: { gte, lt } },
    orderBy: { scheduledAt: "desc" },
    include: { client: true, motorcycle: true },
  });

  const completed = workOrders.filter((wo) => wo.status === "CONCLUIDO");
  const revenue = completed.reduce((sum, wo) => sum + Number(wo.totalAmount), 0);
  const totalDiscount = completed.reduce((sum, wo) => sum + Number(wo.discount), 0);

  const paymentTotals = { DEBITO: 0, CREDITO: 0, PIX: 0, DINHEIRO: 0 };
  for (const wo of completed) {
    if (wo.paymentMethod) paymentTotals[wo.paymentMethod] += Number(wo.totalAmount);
  }

  const statusCounts = { AGENDADO: 0, EM_ANDAMENTO: 0, CONCLUIDO: 0, CANCELADO: 0 };
  for (const wo of workOrders) statusCounts[wo.status]++;

  return {
    orders: workOrders,
    totalOrders: workOrders.length,
    completedOrders: completed.length,
    revenue,
    totalDiscount,
    paymentTotals,
    statusCounts,
  };
}

export async function getReferralReport({ gte, lt }: DateRange) {
  const clients = await prisma.client.findMany({
    where: { createdAt: { gte, lt } },
    select: { referralSource: true },
  });

  const counts = new Map<string, number>();
  let unspecified = 0;
  for (const c of clients) {
    if (!c.referralSource) {
      unspecified++;
      continue;
    }
    counts.set(c.referralSource, (counts.get(c.referralSource) ?? 0) + 1);
  }

  const byReferral = Array.from(counts.entries())
    .map(([key, count]) => ({ name: REFERRAL_SOURCE_LABELS[key] ?? key, count }))
    .sort((a, b) => b.count - a.count);

  if (unspecified > 0) byReferral.push({ name: "Não informado", count: unspecified });

  return { totalNewClients: clients.length, byReferral };
}

export async function getServicesReport({ gte, lt }: DateRange) {
  const lines = await prisma.workOrderService.findMany({
    where: { workOrder: { scheduledAt: { gte, lt }, status: { not: "CANCELADO" } } },
    include: { service: true },
  });

  const stats = new Map<string, { count: number; revenue: number }>();
  for (const line of lines) {
    const name = line.service?.name ?? line.customName ?? "Serviço avulso";
    const entry = stats.get(name) ?? { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += Number(line.price);
    stats.set(name, entry);
  }

  const services = Array.from(stats.entries())
    .map(([name, { count, revenue }]) => ({ name, count, revenue }))
    .sort((a, b) => b.count - a.count);

  return { services };
}
