"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ServiceLineEditor,
  useCustomLineKeyGenerator,
  type CatalogService,
  type CustomLine,
} from "@/components/work-orders/service-line-editor";
import { updateWorkOrderDetailsAction } from "@/lib/actions/work-orders";
import { formatCurrency, toDateTimeLocalValue, fromDateTimeLocalValue } from "@/lib/format";

type ExistingLine = { serviceId: string | null; customName: string | null; price: string };

export function WorkOrderEditDialog({
  workOrderId,
  cylinderTier,
  scheduledAt,
  estimatedDeliveryAt,
  discount,
  notes,
  existingServices,
  services,
}: {
  workOrderId: string;
  cylinderTier: string;
  scheduledAt: Date;
  estimatedDeliveryAt: Date | null;
  discount: string;
  notes: string | null;
  existingServices: ExistingLine[];
  services: CatalogService[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const nextCustomKey = useCustomLineKeyGenerator();

  const [serviceIds, setServiceIds] = useState<string[]>(() =>
    existingServices.filter((s) => s.serviceId).map((s) => s.serviceId!)
  );
  const [customLines, setCustomLines] = useState<CustomLine[]>(() =>
    existingServices
      .filter((s) => !s.serviceId)
      .map((s) => ({ key: nextCustomKey(), name: s.customName ?? "", price: s.price }))
  );
  const [scheduledAtValue, setScheduledAtValue] = useState(() => toDateTimeLocalValue(scheduledAt));
  const [estimatedDeliveryAtValue, setEstimatedDeliveryAtValue] = useState(() =>
    toDateTimeLocalValue(estimatedDeliveryAt ?? scheduledAt)
  );
  const [discountValue, setDiscountValue] = useState(discount);
  const [notesValue, setNotesValue] = useState(notes ?? "");

  const subtotal = useMemo(() => {
    const catalogTotal = services
      .filter((s) => serviceIds.includes(s.id))
      .reduce((sum, s) => {
        const price = s.prices.find((p) => p.tier === cylinderTier)?.price;
        return sum + (price ? Number(price) : 0);
      }, 0);
    const customTotal = customLines.reduce((sum, l) => sum + (Number(l.price) || 0), 0);
    return catalogTotal + customTotal;
  }, [services, serviceIds, cylinderTier, customLines]);

  const clampedDiscount = Math.min(Number(discountValue) || 0, subtotal);
  const total = subtotal - clampedDiscount;

  function toggleService(id: string) {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }
  function addCustomLine() {
    setCustomLines((prev) => [...prev, { key: nextCustomKey(), name: "", price: "" }]);
  }
  function updateCustomLine(key: string, patch: Partial<CustomLine>) {
    setCustomLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }
  function removeCustomLine(key: string) {
    setCustomLines((prev) => prev.filter((l) => l.key !== key));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (serviceIds.length === 0 && customLines.length === 0) {
      setError("Selecione ao menos um serviço.");
      return;
    }
    if (customLines.some((l) => !l.name.trim() || !(Number(l.price) > 0))) {
      setError("Preencha nome e valor de todos os serviços avulsos.");
      return;
    }

    const payload = {
      scheduledAt: fromDateTimeLocalValue(scheduledAtValue),
      estimatedDeliveryAt: fromDateTimeLocalValue(estimatedDeliveryAtValue),
      services: [
        ...serviceIds.map((serviceId) => ({ kind: "catalog" as const, serviceId })),
        ...customLines.map((l) => ({ kind: "custom" as const, name: l.name, price: Number(l.price) })),
      ],
      discount: clampedDiscount,
      notes: notesValue,
    };

    startTransition(async () => {
      try {
        await updateWorkOrderDetailsAction(workOrderId, payload);
        toast.success("Ordem de serviço atualizada.");
        setOpen(false);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Não foi possível atualizar a OS.";
        setError(message);
        toast.error(message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Pencil className="size-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar ordem de serviço</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Serviços</p>
            <ServiceLineEditor
              services={services}
              tier={cylinderTier}
              selectedServiceIds={serviceIds}
              onToggleService={toggleService}
              customLines={customLines}
              onAddCustomLine={addCustomLine}
              onUpdateCustomLine={updateCustomLine}
              onRemoveCustomLine={removeCustomLine}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editScheduledAt">Data e hora *</Label>
              <Input
                id="editScheduledAt"
                type="datetime-local"
                value={scheduledAtValue}
                onChange={(e) => setScheduledAtValue(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editEstimatedDeliveryAt">Previsão de entrega *</Label>
              <Input
                id="editEstimatedDeliveryAt"
                type="datetime-local"
                value={estimatedDeliveryAtValue}
                onChange={(e) => setEstimatedDeliveryAtValue(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editDiscount">Desconto (R$)</Label>
              <Input
                id="editDiscount"
                inputMode="decimal"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="editNotes">Observações</Label>
            <Textarea id="editNotes" value={notesValue} onChange={(e) => setNotesValue(e.target.value)} />
          </div>

          {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <div className="rounded-lg border border-border-strong bg-surface-raised p-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {clampedDiscount > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                <span>Desconto</span>
                <span>- {formatCurrency(clampedDiscount)}</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-border-subtle pt-2">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="self-end">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
