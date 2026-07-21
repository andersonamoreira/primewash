import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Bike, CalendarClock, PackageCheck, StickyNote, Printer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { WorkOrderStatusBadge } from "@/components/work-orders/status-badge";
import { StatusActions } from "@/components/work-orders/status-actions";
import { WorkOrderEditDialog } from "@/components/work-orders/work-order-edit-dialog";
import { PaymentMethodEditor } from "@/components/work-orders/payment-method-editor";
import { PhotoChecklist } from "@/components/work-orders/photo-checklist";
import { deleteWorkOrderAction } from "@/lib/actions/work-orders";
import { CYLINDER_TIER_LABELS, formatCurrency, formatDateTime } from "@/lib/format";

const EDITABLE_STATUSES = new Set(["AGENDADO", "EM_ANDAMENTO"]);

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, workOrder, catalogServices] = await Promise.all([
    auth(),
    prisma.workOrder.findUnique({
      where: { id },
      include: {
        client: true,
        motorcycle: true,
        services: { include: { service: true } },
        photos: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { prices: true, group: true },
    }),
  ]);

  if (!workOrder) notFound();

  const canEdit = EDITABLE_STATUSES.has(workOrder.status);
  const isAdmin = session?.user.role === "ADMIN";
  const canReopen = isAdmin || Boolean(session?.user.canReopenWorkOrder);
  const subtotal = workOrder.services.reduce((sum, s) => sum + Number(s.price), 0);
  const discount = Number(workOrder.discount);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/ordens"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">OS #{workOrder.number}</h1>
            <WorkOrderStatusBadge status={workOrder.status} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarClock className="size-3.5" /> {formatDateTime(workOrder.scheduledAt)}
          </p>
          {workOrder.estimatedDeliveryAt && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <PackageCheck className="size-3.5" /> Previsão de entrega: {formatDateTime(workOrder.estimatedDeliveryAt)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <WorkOrderEditDialog
              workOrderId={workOrder.id}
              cylinderTier={workOrder.motorcycle.cylinderTier}
              scheduledAt={workOrder.scheduledAt}
              estimatedDeliveryAt={workOrder.estimatedDeliveryAt}
              discount={workOrder.discount.toString()}
              notes={workOrder.notes}
              existingServices={workOrder.services.map((s) => ({
                serviceId: s.serviceId,
                customName: s.customName,
                price: s.price.toString(),
              }))}
              services={catalogServices.map((s) => ({
                id: s.id,
                name: s.name,
                groupName: s.group?.name ?? null,
                prices: s.prices.map((p) => ({ tier: p.tier, price: p.price.toString() })),
              }))}
            />
          )}
          <Button asChild size="sm" variant="secondary">
            <Link href={`/ordens/${workOrder.id}/imprimir`} target="_blank">
              <Printer className="size-4" /> Imprimir
            </Link>
          </Button>
          <StatusActions workOrderId={workOrder.id} status={workOrder.status} canReopen={canReopen} />
          {isAdmin && (
            <DeleteButton
              confirmMessage={`Excluir a OS #${workOrder.number}? Essa ação não pode ser desfeita.`}
              action={deleteWorkOrderAction.bind(null, workOrder.id)}
              redirectTo="/ordens"
            />
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex h-full items-center">
          <CardContent className="w-full">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="size-3.5" /> Cliente
            </p>
            <Link href={`/clientes/${workOrder.client.id}`} className="font-medium text-foreground hover:text-primary">
              {workOrder.client.name}
            </Link>
            <p className="text-sm text-muted-foreground">{workOrder.client.phone}</p>
          </CardContent>
        </Card>
        <Card className="flex h-full items-center">
          <CardContent className="w-full">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Bike className="size-3.5" /> Moto
            </p>
            <p className="font-medium text-foreground">
              {workOrder.motorcycle.brand} {workOrder.motorcycle.model} · {workOrder.motorcycle.color}
            </p>
            <p className="text-sm text-muted-foreground">
              {workOrder.motorcycle.plate ? `${workOrder.motorcycle.plate} · ` : ""}
              {CYLINDER_TIER_LABELS[workOrder.motorcycle.cylinderTier]}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent>
          <p className="mb-3 text-sm font-semibold text-foreground">Serviços</p>
          <div className="flex flex-col gap-2">
            {workOrder.services.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{s.service?.name ?? s.customName}</span>
                <span className="text-muted-foreground">{formatCurrency(s.price.toString())}</span>
              </div>
            ))}
          </div>
          {discount > 0 && (
            <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
              <span>Desconto</span>
              <span>- {formatCurrency(discount)}</span>
            </div>
          )}
          <div
            className={`mt-3 flex items-center justify-between pt-3 ${discount > 0 ? "" : "border-t border-border-subtle"}`}
          >
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(workOrder.totalAmount.toString())}
            </span>
          </div>
          <div className="mt-4">
            <p className="mb-1.5 text-xs text-muted-foreground">Forma de pagamento</p>
            <PaymentMethodEditor workOrderId={workOrder.id} paymentMethod={workOrder.paymentMethod} />
          </div>
        </CardContent>
      </Card>

      {workOrder.notes && (
        <Card className="mb-6">
          <CardContent className="flex items-start gap-2 text-sm text-muted-foreground">
            <StickyNote className="mt-0.5 size-4 shrink-0" /> {workOrder.notes}
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Checklist de avarias</h2>
        <Card>
          <CardContent>
            <PhotoChecklist workOrderId={workOrder.id} photos={workOrder.photos} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
