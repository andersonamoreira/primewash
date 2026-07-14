import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, FileText, MapPin, Megaphone, StickyNote, Bike, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { ClientEditDialog } from "@/components/clients/client-edit-dialog";
import { MotorcycleDialog } from "@/components/clients/motorcycle-dialog";
import { deleteClientAction, deleteMotorcycleAction } from "@/lib/actions/clients";
import { WorkOrderStatusBadge } from "@/components/work-orders/status-badge";
import {
  CYLINDER_TIER_LABELS,
  REFERRAL_SOURCE_LABELS,
  formatCurrency,
  formatDateTime,
  daysSince,
  relativeDaysLabel,
} from "@/lib/format";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      motorcycles: { orderBy: { createdAt: "asc" } },
      workOrders: {
        orderBy: { scheduledAt: "desc" },
        include: {
          motorcycle: true,
          services: { include: { service: true } },
        },
      },
    },
  });

  if (!client) notFound();

  const lastCompleted = client.workOrders.find((wo) => wo.status === "CONCLUIDO");
  const daysSinceLast = lastCompleted
    ? daysSince(lastCompleted.finishedAt ?? lastCompleted.scheduledAt)
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/clientes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" /> {client.phone}
            </span>
            {client.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5" /> {client.email}
              </span>
            )}
            {client.document && (
              <span className="flex items-center gap-1.5">
                <FileText className="size-3.5" /> {client.document}
              </span>
            )}
            {(client.city || client.state) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {[client.city, client.state].filter(Boolean).join(" / ")}
              </span>
            )}
            {client.referralSource && (
              <span className="flex items-center gap-1.5">
                <Megaphone className="size-3.5" /> {REFERRAL_SOURCE_LABELS[client.referralSource]}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <ClientEditDialog
            client={{
              id: client.id,
              name: client.name,
              phone: client.phone,
              email: client.email,
              document: client.document,
              city: client.city,
              state: client.state,
              referralSource: client.referralSource,
              notes: client.notes,
            }}
          />
          <DeleteButton
            label="Excluir"
            confirmMessage="Excluir este cliente e todas as motos vinculadas? Essa ação não pode ser desfeita."
            action={deleteClientAction.bind(null, client.id)}
            redirectTo="/clientes"
          />
        </div>
      </div>

      {client.notes && (
        <Card className="mb-6">
          <CardContent className="flex items-start gap-2 text-sm text-muted-foreground">
            <StickyNote className="mt-0.5 size-4 shrink-0" />
            {client.notes}
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="flex h-full items-center">
          <CardContent className="w-full">
            <p className="text-xs text-muted-foreground">Motos cadastradas</p>
            <p className="text-xl font-bold text-foreground">{client.motorcycles.length}</p>
          </CardContent>
        </Card>
        <Card className="flex h-full items-center">
          <CardContent className="w-full">
            <p className="text-xs text-muted-foreground">Serviços realizados</p>
            <p className="text-xl font-bold text-foreground">
              {client.workOrders.filter((wo) => wo.status === "CONCLUIDO").length}
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2 flex h-full items-center sm:col-span-1">
          <CardContent className="w-full">
            <p className="text-xs text-muted-foreground">Última lavagem</p>
            <p className="text-xl font-bold text-foreground">
              {daysSinceLast !== null ? relativeDaysLabel(daysSinceLast) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Bike className="size-5 text-primary" /> Motos
          </h2>
          <MotorcycleDialog clientId={client.id} mode="create" />
        </div>

        {client.motorcycles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-strong p-6 text-center text-sm text-muted-foreground">
            Nenhuma moto cadastrada ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {client.motorcycles.map((moto) => (
              <div
                key={moto.id}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface p-3.5"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {moto.brand} {moto.model}{" "}
                    <span className="text-muted-foreground">· {moto.color}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-surface-raised px-1.5 py-0.5 font-mono tracking-wide">
                      {moto.plate}
                    </span>
                    <Badge variant="secondary">{CYLINDER_TIER_LABELS[moto.cylinderTier]}</Badge>
                  </div>
                  {moto.notes && (
                    <p className="mt-1.5 text-xs text-muted-foreground">{moto.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <MotorcycleDialog clientId={client.id} mode="edit" motorcycle={moto} />
                  <DeleteButton
                    confirmMessage={`Excluir a moto ${moto.brand} ${moto.model} (${moto.plate})?`}
                    action={deleteMotorcycleAction.bind(null, moto.id, client.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ClipboardList className="size-5 text-primary" /> Histórico de serviços
          </h2>
          <Button asChild size="sm" variant="secondary">
            <Link href={`/ordens/novo?clientId=${client.id}`}>Nova OS</Link>
          </Button>
        </div>

        {client.workOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-strong p-6 text-center text-sm text-muted-foreground">
            Nenhuma ordem de serviço registrada ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {client.workOrders.map((wo) => (
              <Link
                key={wo.id}
                href={`/ordens/${wo.id}`}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface p-3.5 transition-colors hover:border-primary/40"
              >
                <div>
                  <p className="font-medium text-foreground">
                    OS #{wo.number} · {wo.motorcycle.brand} {wo.motorcycle.model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(wo.scheduledAt)} ·{" "}
                    {wo.services.map((s) => s.service.name).join(", ") || "Sem serviços"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <WorkOrderStatusBadge status={wo.status} />
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(wo.totalAmount.toString())}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
