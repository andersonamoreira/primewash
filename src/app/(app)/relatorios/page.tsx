import { Bike, Wallet, CheckCircle2, Percent, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ChartCard } from "@/components/dashboard/chart-card";
import { SimpleBarChart } from "@/components/dashboard/charts/bar-chart";
import { PaymentMethodBars } from "@/components/dashboard/charts/payment-method-bars";
import { WorkOrderStatusBadge } from "@/components/work-orders/status-badge";
import {
  getSalesReport,
  getReferralReport,
  getServicesReport,
} from "@/lib/queries/reports";
import {
  formatCurrency,
  formatDate,
  monthBoundsInAppTimeZone,
  dayStartInAppTimeZone,
  dayEndExclusiveInAppTimeZone,
  toDateTimeLocalValue,
} from "@/lib/format";

const STATUS_LABELS_SHORT: Record<string, string> = {
  AGENDADO: "Agendadas",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluídas",
  CANCELADO: "Canceladas",
};

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;

  const now = new Date();
  const monthBounds = monthBoundsInAppTimeZone(now);
  const gte = from ? dayStartInAppTimeZone(from) : monthBounds.start;
  const lt = to ? dayEndExclusiveInAppTimeZone(to) : monthBounds.end;
  const fromValue = from ?? toDateTimeLocalValue(monthBounds.start).slice(0, 10);
  const toValue = to ?? toDateTimeLocalValue(now).slice(0, 10);

  const [sales, referral, services] = await Promise.all([
    getSalesReport({ gte, lt }),
    getReferralReport({ gte, lt }),
    getServicesReport({ gte, lt }),
  ]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Vendas, mídias de captação e serviços mais vendidos no período selecionado.
          </p>
        </div>
        <form className="flex flex-wrap items-end gap-3" action="/relatorios">
          <div className="flex flex-col gap-1">
            <label htmlFor="from" className="text-xs font-medium text-muted-foreground">
              De
            </label>
            <input
              id="from"
              type="date"
              name="from"
              defaultValue={fromValue}
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
              defaultValue={toValue}
              className="rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-foreground"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Filtrar
          </Button>
        </form>
      </div>

      <Tabs defaultValue="vendas">
        <TabsList>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="midias">Mídias</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas">
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile
              label="OS no período"
              value={String(sales.totalOrders)}
              icon={Bike}
              color="blue"
            />
            <StatTile
              label="OS concluídas"
              value={String(sales.completedOrders)}
              icon={CheckCircle2}
              color="teal"
            />
            <StatTile
              label="Faturamento"
              value={formatCurrency(sales.revenue)}
              sublabel="serviços concluídos"
              icon={Wallet}
              color="green"
            />
            <StatTile
              label="Descontos"
              value={formatCurrency(sales.totalDiscount)}
              sublabel="concedidos"
              icon={Percent}
              color="orange"
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Faturamento por forma de pagamento">
              <PaymentMethodBars totals={sales.paymentTotals} />
            </ChartCard>

            <Card>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-foreground">OS por status</p>
                {Object.entries(sales.statusCounts).map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{STATUS_LABELS_SHORT[key]}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">OS</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhuma OS neste período.
                      </td>
                    </tr>
                  ) : (
                    sales.orders.map((wo) => (
                      <tr key={wo.id} className="border-b border-border-subtle last:border-0">
                        <td className="px-4 py-3 text-foreground">#{wo.number}</td>
                        <td className="px-4 py-3 text-foreground">{wo.client.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(wo.scheduledAt)}</td>
                        <td className="px-4 py-3">
                          <WorkOrderStatusBadge status={wo.status} />
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          {formatCurrency(wo.totalAmount.toString())}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="midias">
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile
              label="Novos clientes"
              value={String(referral.totalNewClients)}
              sublabel="cadastrados no período"
              icon={Users}
              color="violet"
            />
          </div>
          <ChartCard
            title="Como conheceram a loja"
            description="Novos clientes cadastrados no período, por origem"
          >
            <SimpleBarChart data={referral.byReferral} orientation="horizontal" />
          </ChartCard>
        </TabsContent>

        <TabsContent value="servicos">
          <ChartCard title="Serviços mais vendidos" description="Quantidade de vezes vendido no período">
            <SimpleBarChart
              data={services.services.slice(0, 8).map((s) => ({ name: s.name, count: s.count }))}
              orientation="horizontal"
            />
          </ChartCard>

          <div className="mt-6 rounded-xl border border-border-subtle bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Serviço</th>
                    <th className="px-4 py-3 text-right font-medium">Qtd. vendida</th>
                    <th className="px-4 py-3 text-right font-medium">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {services.services.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhum serviço vendido neste período.
                      </td>
                    </tr>
                  ) : (
                    services.services.map((s) => (
                      <tr key={s.name} className="border-b border-border-subtle last:border-0">
                        <td className="px-4 py-3 text-foreground">{s.name}</td>
                        <td className="px-4 py-3 text-right text-foreground">{s.count}</td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          {formatCurrency(s.revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
