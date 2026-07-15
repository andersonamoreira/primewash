"use client";

import { useRef } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

export type CatalogService = {
  id: string;
  name: string;
  groupName: string | null;
  prices: { tier: string; price: string }[];
};

export type CustomLine = { key: string; name: string; price: string };

export function ServiceLineEditor({
  services,
  tier,
  selectedServiceIds,
  onToggleService,
  customLines,
  onAddCustomLine,
  onUpdateCustomLine,
  onRemoveCustomLine,
}: {
  services: CatalogService[];
  tier?: string;
  selectedServiceIds: string[];
  onToggleService: (id: string) => void;
  customLines: CustomLine[];
  onAddCustomLine: () => void;
  onUpdateCustomLine: (key: string, patch: Partial<CustomLine>) => void;
  onRemoveCustomLine: (key: string) => void;
}) {
  const groups = new Map<string, CatalogService[]>();
  for (const service of services) {
    const groupName = service.groupName ?? "Outros";
    if (!groups.has(groupName)) groups.set(groupName, []);
    groups.get(groupName)!.push(service);
  }

  return (
    <div className="flex flex-col gap-5">
      {!tier && (
        <p className="text-sm text-muted-foreground">
          Selecione a moto para ver os preços da categoria de cilindrada correta.
        </p>
      )}

      {[...groups.entries()].map(([groupName, groupServices]) => (
        <div key={groupName}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {groupName}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {groupServices.map((service) => {
              const price = tier ? service.prices.find((p) => p.tier === tier)?.price : undefined;
              const checked = selectedServiceIds.includes(service.id);
              return (
                <button
                  type="button"
                  key={service.id}
                  onClick={() => onToggleService(service.id)}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                    checked ? "border-primary bg-primary/10" : "border-border-subtle hover:bg-surface-raised"
                  )}
                >
                  <span className="text-foreground">{service.name}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {price ? formatCurrency(price) : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Serviços avulsos
          </p>
          <Button type="button" size="sm" variant="secondary" onClick={onAddCustomLine}>
            <Plus className="size-3.5" /> Adicionar avulso
          </Button>
        </div>

        {customLines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Use para lançar um serviço que não está no catálogo, com valor livre.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {customLines.map((line) => (
              <div key={line.key} className="flex items-center gap-2">
                <Input
                  value={line.name}
                  onChange={(e) => onUpdateCustomLine(line.key, { name: e.target.value })}
                  placeholder="Nome do serviço"
                  className="flex-1"
                />
                <Input
                  value={line.price}
                  onChange={(e) => onUpdateCustomLine(line.key, { price: e.target.value })}
                  placeholder="Valor"
                  inputMode="decimal"
                  className="w-28"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0 text-danger hover:bg-danger/10"
                  onClick={() => onRemoveCustomLine(line.key)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function useCustomLineKeyGenerator() {
  const ref = useRef(0);
  return () => {
    ref.current += 1;
    return `custom-${ref.current}`;
  };
}
