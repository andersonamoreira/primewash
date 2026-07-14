"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, Bike } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { createWorkOrderAction } from "@/lib/actions/work-orders";
import { CYLINDER_TIER_LABELS, PAYMENT_METHOD_LABELS, formatCurrency } from "@/lib/format";
import { CYLINDER_TIERS } from "@/lib/validations/client";
import { MOTORCYCLE_BRANDS } from "@/lib/motorcycle-brands";

type ClientWithMotos = {
  id: string;
  name: string;
  phone: string;
  motorcycles: { id: string; brand: string; model: string; plate: string; cylinderTier: string }[];
};

type ServiceOption = {
  id: string;
  name: string;
  prices: { tier: string; price: string }[];
};

export function WorkOrderForm({
  clients,
  services,
  initialClientId,
}: {
  clients: ClientWithMotos[];
  services: ServiceOption[];
  initialClientId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const [clientMode, setClientMode] = useState<"existing" | "new">(
    initialClientId ? "existing" : clients.length > 0 ? "existing" : "new"
  );
  const [clientId, setClientId] = useState<string | undefined>(initialClientId);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  const selectedClient = clients.find((c) => c.id === clientId);

  const [motorcycleMode, setMotorcycleMode] = useState<"existing" | "new">("existing");
  const [motorcycleId, setMotorcycleId] = useState<string | undefined>();
  const [newMoto, setNewMoto] = useState({
    brand: "",
    model: "",
    color: "",
    plate: "",
    cylinderTier: "MEDIA",
    notes: "",
  });

  const [scheduledAt, setScheduledAt] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [estimatedDeliveryAt, setEstimatedDeliveryAt] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [notes, setNotes] = useState("");

  const effectiveTier =
    clientMode === "new" || motorcycleMode === "new"
      ? newMoto.cylinderTier
      : selectedClient?.motorcycles.find((m) => m.id === motorcycleId)?.cylinderTier;

  const total = useMemo(() => {
    if (!effectiveTier) return 0;
    return services
      .filter((s) => serviceIds.includes(s.id))
      .reduce((sum, s) => {
        const price = s.prices.find((p) => p.tier === effectiveTier)?.price;
        return sum + (price ? Number(price) : 0);
      }, 0);
  }, [services, serviceIds, effectiveTier]);

  function toggleService(id: string) {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (serviceIds.length === 0) {
      setError("Selecione ao menos um serviço.");
      return;
    }

    const payload = {
      clientId: clientMode === "existing" ? clientId : undefined,
      newClient: clientMode === "new" ? { name: newClientName, phone: newClientPhone } : undefined,
      motorcycleId:
        clientMode === "existing" && motorcycleMode === "existing" ? motorcycleId : undefined,
      newMotorcycle:
        clientMode === "new" || motorcycleMode === "new"
          ? {
              brand: newMoto.brand,
              model: newMoto.model,
              color: newMoto.color,
              plate: newMoto.plate,
              cylinderTier: newMoto.cylinderTier,
              notes: newMoto.notes,
            }
          : undefined,
      scheduledAt: new Date(scheduledAt).toISOString(),
      estimatedDeliveryAt: new Date(estimatedDeliveryAt).toISOString(),
      serviceIds,
      paymentMethod: paymentMethod || undefined,
      notes,
    };

    startTransition(async () => {
      try {
        const result = await createWorkOrderAction(payload);
        toast.success("Ordem de serviço criada com sucesso.");
        router.push(`/ordens/${result.id}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Não foi possível criar a OS.";
        setError(message);
        toast.error(message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <UserPlus className="size-4 text-primary" /> Cliente
        </h2>

        <Tabs value={clientMode} onValueChange={(v) => setClientMode(v as "existing" | "new")}>
          <TabsList>
            <TabsTrigger value="existing">Cliente existente</TabsTrigger>
            <TabsTrigger value="new">Novo cliente</TabsTrigger>
          </TabsList>

          <TabsContent value="existing">
            <Combobox
              options={clients.map((c) => ({ value: c.id, label: c.name, sublabel: c.phone }))}
              value={clientId}
              onChange={(v) => {
                setClientId(v);
                setMotorcycleId(undefined);
                setMotorcycleMode("existing");
              }}
              placeholder="Buscar cliente por nome ou telefone"
              emptyText="Nenhum cliente cadastrado ainda."
            />
          </TabsContent>

          <TabsContent value="new">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newClientName">Nome *</Label>
                <Input
                  id="newClientName"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  required={clientMode === "new"}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newClientPhone">Telefone *</Label>
                <PhoneInput
                  id="newClientPhone"
                  value={newClientPhone}
                  onValueChange={setNewClientPhone}
                  required={clientMode === "new"}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Bike className="size-4 text-primary" /> Moto
        </h2>

        {clientMode === "existing" && selectedClient && selectedClient.motorcycles.length > 0 && (
          <Tabs value={motorcycleMode} onValueChange={(v) => setMotorcycleMode(v as "existing" | "new")}>
            <TabsList>
              <TabsTrigger value="existing">Moto cadastrada</TabsTrigger>
              <TabsTrigger value="new">Nova moto</TabsTrigger>
            </TabsList>

            <TabsContent value="existing">
              <div className="flex flex-col gap-2">
                {selectedClient.motorcycles.map((moto) => (
                  <button
                    type="button"
                    key={moto.id}
                    onClick={() => setMotorcycleId(moto.id)}
                    className={cn(
                      "flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                      motorcycleId === moto.id
                        ? "border-primary bg-primary/10"
                        : "border-border-subtle hover:bg-surface-raised"
                    )}
                  >
                    <span>
                      {moto.brand} {moto.model} · {moto.plate}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {CYLINDER_TIER_LABELS[moto.cylinderTier]}
                    </span>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="new">
              <NewMotoFields value={newMoto} onChange={setNewMoto} />
            </TabsContent>
          </Tabs>
        )}

        {(clientMode === "new" || !selectedClient || selectedClient.motorcycles.length === 0) && (
          <NewMotoFields value={newMoto} onChange={setNewMoto} />
        )}
      </section>

      <section className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
        <h2 className="mb-3 font-semibold text-foreground">Serviços</h2>
        {!effectiveTier && (
          <p className="mb-3 text-sm text-muted-foreground">
            Selecione a moto para ver os preços da categoria de cilindrada correta.
          </p>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {services.map((service) => {
            const price = effectiveTier
              ? service.prices.find((p) => p.tier === effectiveTier)?.price
              : undefined;
            const checked = serviceIds.includes(service.id);
            return (
              <button
                type="button"
                key={service.id}
                onClick={() => toggleService(service.id)}
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
      </section>

      <section className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
        <h2 className="mb-3 font-semibold text-foreground">Agendamento &amp; pagamento</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="scheduledAt">Data e hora *</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="estimatedDeliveryAt">Previsão de entrega *</Label>
            <Input
              id="estimatedDeliveryAt"
              type="datetime-local"
              value={estimatedDeliveryAt}
              onChange={(e) => setEstimatedDeliveryAt(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="paymentMethod">Forma de pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Definir depois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBITO">{PAYMENT_METHOD_LABELS.DEBITO}</SelectItem>
                <SelectItem value="CREDITO">{PAYMENT_METHOD_LABELS.CREDITO}</SelectItem>
                <SelectItem value="PIX">{PAYMENT_METHOD_LABELS.PIX}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </section>

      {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="flex items-center justify-between rounded-xl border border-border-strong bg-surface-raised p-4">
        <div>
          <p className="text-xs text-muted-foreground">Total estimado</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(total)}</p>
        </div>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Abrir OS
        </Button>
      </div>
    </form>
  );
}

type NewMotoValue = {
  brand: string;
  model: string;
  color: string;
  plate: string;
  cylinderTier: string;
  notes: string;
};

function NewMotoFields({
  value,
  onChange,
}: {
  value: NewMotoValue;
  onChange: (value: NewMotoValue) => void;
}) {
  const [brandMode, setBrandMode] = useState(() =>
    !value.brand ? "" : (MOTORCYCLE_BRANDS as readonly string[]).includes(value.brand) ? value.brand : "Outra"
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newMotoBrand">Marca *</Label>
        <Select
          value={brandMode}
          onValueChange={(v) => {
            setBrandMode(v);
            onChange({ ...value, brand: v === "Outra" ? "" : v });
          }}
        >
          <SelectTrigger id="newMotoBrand">
            <SelectValue placeholder="Selecione a marca" />
          </SelectTrigger>
          <SelectContent>
            {MOTORCYCLE_BRANDS.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newMotoModel">Modelo *</Label>
        <Input
          id="newMotoModel"
          value={value.model}
          onChange={(e) => onChange({ ...value, model: e.target.value })}
          required
        />
      </div>

      {brandMode === "Outra" && (
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="newMotoCustomBrand">Qual marca? *</Label>
          <Input
            id="newMotoCustomBrand"
            value={value.brand}
            onChange={(e) => onChange({ ...value, brand: e.target.value })}
            placeholder="Digite a marca"
            required
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newMotoColor">Cor *</Label>
        <Input
          id="newMotoColor"
          value={value.color}
          onChange={(e) => onChange({ ...value, color: e.target.value })}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newMotoPlate">Placa *</Label>
        <Input
          id="newMotoPlate"
          value={value.plate}
          onChange={(e) => onChange({ ...value, plate: e.target.value.toUpperCase() })}
          className="uppercase"
          required
        />
      </div>
      <div className="col-span-2 flex flex-col gap-1.5">
        <Label htmlFor="newMotoTier">Categoria de cilindrada *</Label>
        <Select value={value.cylinderTier} onValueChange={(v) => onChange({ ...value, cylinderTier: v })}>
          <SelectTrigger id="newMotoTier">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CYLINDER_TIERS.map((tier) => (
              <SelectItem key={tier} value={tier}>
                {CYLINDER_TIER_LABELS[tier]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 flex flex-col gap-1.5">
        <Label htmlFor="newMotoNotes">Observações</Label>
        <Textarea
          id="newMotoNotes"
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder="Avarias pré-existentes, acessórios, observações gerais..."
        />
      </div>
    </div>
  );
}
