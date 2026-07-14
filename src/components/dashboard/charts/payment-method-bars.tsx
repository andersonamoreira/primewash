import { formatCurrency } from "@/lib/format";

const METHODS = [
  { key: "DEBITO" as const, label: "Cartão de Débito", color: "#1670b0" },
  { key: "CREDITO" as const, label: "Cartão de Crédito", color: "#b8842e" },
  { key: "PIX" as const, label: "Pix", color: "#1f9c5a" },
];

export function PaymentMethodBars({
  totals,
}: {
  totals: Record<"DEBITO" | "CREDITO" | "PIX", number>;
}) {
  const max = Math.max(...METHODS.map((m) => totals[m.key]), 1);
  const grandTotal = METHODS.reduce((sum, m) => sum + totals[m.key], 0);

  if (grandTotal === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Nenhum pagamento registrado neste período.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {METHODS.map((method) => {
        const value = totals[method.key];
        const widthPct = Math.max((value / max) * 100, value > 0 ? 4 : 0);
        return (
          <div key={method.key}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: method.color }} />
                {method.label}
              </span>
              <span className="font-semibold text-foreground">{formatCurrency(value)}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${widthPct}%`, backgroundColor: method.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
