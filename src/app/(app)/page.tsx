import { Bike, Wallet, CalendarClock, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries/dashboard";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ChartCard } from "@/components/dashboard/chart-card";
import { SimpleBarChart } from "@/components/dashboard/charts/bar-chart";
import { RevenueChart } from "@/components/dashboard/charts/revenue-chart";
import { PaymentMethodBars } from "@/components/dashboard/charts/payment-method-bars";
import { formatCurrency, greetingForHour, formatLongDate, getHourInAppTimeZone } from "@/lib/format";

export default async function DashboardPage() {
  const [session, data] = await Promise.all([auth(), getDashboardData()]);
  const now = new Date();
  const firstName = session?.user.name?.split(" ")[0] ?? "";
  const { from: monthFrom, to: monthTo } = data.monthRange;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {greetingForHour(getHourInAppTimeZone(now))}
          {firstName ? `, ${firstName}` : ""}! 👋
        </h1>
        <p className="text-sm text-muted-foreground">{formatLongDate(now)}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Motos recebidas"
          value={String(data.stats.motosRecebidas)}
          sublabel="neste mês"
          icon={Bike}
          color="blue"
          href={`/ordens?from=${monthFrom}&to=${monthTo}&statusNot=CANCELADO`}
        />
        <StatTile
          label="Faturamento"
          value={formatCurrency(data.stats.revenueThisMonth)}
          sublabel="neste mês · líquido de taxas"
          icon={Wallet}
          color="green"
          href={`/ordens?from=${monthFrom}&to=${monthTo}&status=CONCLUIDO`}
        />
        <StatTile
          label="Agendamentos"
          value={String(data.stats.upcomingCount)}
          sublabel="aguardando atendimento"
          icon={CalendarClock}
          color="violet"
          href="/ordens?status=AGENDADO"
        />
        <StatTile
          label="Clientes"
          value={String(data.stats.totalClients)}
          sublabel="cadastrados no total"
          icon={Users}
          color="teal"
          href="/clientes"
        />
      </div>

      <div className="mb-6">
        <ChartCard title="Faturamento no mês" description="Serviços concluídos por dia · valores líquidos de taxas">
          <RevenueChart
            data={data.revenueSeries.map((d) => ({
              ...d,
              href: `/ordens?from=${d.dateISO}&to=${d.dateISO}&status=CONCLUIDO`,
            }))}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Motos recebidas por marca/modelo" description="Neste mês">
          <SimpleBarChart
            data={data.motosByBrand.map((d) => ({
              name: d.name,
              count: d.count,
              href: `/ordens?from=${monthFrom}&to=${monthTo}&statusNot=CANCELADO&moto=${encodeURIComponent(d.brand)}`,
            }))}
            orientation="horizontal"
          />
        </ChartCard>

        <ChartCard title="Pacotes mais vendidos" description="Neste mês">
          <SimpleBarChart
            data={data.topServices.map((d) => ({
              ...d,
              href: `/ordens?from=${monthFrom}&to=${monthTo}&statusNot=CANCELADO&service=${encodeURIComponent(d.name)}`,
            }))}
            orientation="horizontal"
          />
        </ChartCard>

        <ChartCard title="Horários mais agendados" description="Distribuição por hora do dia">
          <SimpleBarChart
            data={data.byHour.map((h) => ({
              name: h.label,
              count: h.count,
              href: `/ordens?from=${monthFrom}&to=${monthTo}&statusNot=CANCELADO&hour=${h.hour}`,
            }))}
            orientation="vertical"
          />
        </ChartCard>

        <ChartCard
          title="Faturamento por forma de pagamento"
          description="Serviços concluídos neste mês · valores líquidos de taxas"
        >
          <PaymentMethodBars
            totals={data.paymentTotals}
            hrefs={{
              DEBITO: `/ordens?from=${monthFrom}&to=${monthTo}&status=CONCLUIDO&paymentMethod=DEBITO`,
              CREDITO: `/ordens?from=${monthFrom}&to=${monthTo}&status=CONCLUIDO&paymentMethod=CREDITO`,
              PIX: `/ordens?from=${monthFrom}&to=${monthTo}&status=CONCLUIDO&paymentMethod=PIX`,
              DINHEIRO: `/ordens?from=${monthFrom}&to=${monthTo}&status=CONCLUIDO&paymentMethod=DINHEIRO`,
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
