import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/work-orders/print-button";
import {
  CYLINDER_TIER_LABELS,
  PAYMENT_METHOD_LABELS,
  WORK_ORDER_STATUS_LABELS,
  formatCurrency,
  formatDateTime,
} from "@/lib/format";

export default async function PrintWorkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      client: true,
      motorcycle: true,
      services: { include: { service: true } },
      photos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!workOrder) notFound();

  const subtotal = workOrder.services.reduce((sum, s) => sum + Number(s.price), 0);
  const discount = Number(workOrder.discount);

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-white px-6 py-8 text-gray-900 print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <header className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Prime Wash" width={56} height={56} className="rounded-md object-cover" />
          <div>
            <p className="text-lg font-bold">Prime Wash</p>
            <p className="text-xs text-gray-500">Estética de Motos</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">OS #{workOrder.number}</p>
          <p className="text-sm text-gray-500">{WORK_ORDER_STATUS_LABELS[workOrder.status]}</p>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-6">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Cliente</p>
          <p className="font-medium">{workOrder.client.name}</p>
          <p className="text-sm text-gray-600">{workOrder.client.phone}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Moto</p>
          <p className="font-medium">
            {workOrder.motorcycle.brand} {workOrder.motorcycle.model} · {workOrder.motorcycle.color}
          </p>
          <p className="text-sm text-gray-600">
            {workOrder.motorcycle.plate ? `${workOrder.motorcycle.plate} · ` : ""}
            {CYLINDER_TIER_LABELS[workOrder.motorcycle.cylinderTier]}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Agendamento</p>
          <p className="text-sm">{formatDateTime(workOrder.scheduledAt)}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Previsão de entrega</p>
          <p className="text-sm">
            {workOrder.estimatedDeliveryAt ? formatDateTime(workOrder.estimatedDeliveryAt) : "A definir"}
          </p>
        </div>
      </div>

      <table className="mb-2 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="pb-2">Serviço</th>
            <th className="pb-2 text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {workOrder.services.map((s) => (
            <tr key={s.id} className="border-b border-gray-100">
              <td className="py-2">
                <p>{s.service?.name ?? s.customName}</p>
                {s.service?.description && (
                  <p className="text-xs text-gray-500">{s.service.description}</p>
                )}
              </td>
              <td className="py-2 text-right align-top">{formatCurrency(s.price.toString())}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-6 flex flex-col items-end gap-1 text-sm">
        {discount > 0 && (
          <>
            <div className="flex w-48 justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex w-48 justify-between text-gray-600">
              <span>Desconto</span>
              <span>- {formatCurrency(discount)}</span>
            </div>
          </>
        )}
        <div className="flex w-48 justify-between border-t border-gray-300 pt-1 text-base font-bold">
          <span>Total</span>
          <span>{formatCurrency(workOrder.totalAmount.toString())}</span>
        </div>
        <div className="mt-1 text-gray-600">
          Pagamento:{" "}
          {workOrder.paymentMethod ? PAYMENT_METHOD_LABELS[workOrder.paymentMethod] : "A definir"}
        </div>
      </div>

      {workOrder.notes && (
        <div className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Observações</p>
          <p className="text-sm text-gray-700">{workOrder.notes}</p>
        </div>
      )}

      {workOrder.photos.length > 0 && (
        <div className="mb-6 break-inside-avoid">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Checklist de avarias
          </p>
          <div className="grid grid-cols-4 gap-2">
            {workOrder.photos.map((photo) => (
              <div key={photo.id} className="break-inside-avoid">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/files/${photo.photoPath}`}
                  alt={photo.description ?? "Foto da avaria"}
                  className="aspect-square w-full rounded border border-gray-200 object-cover"
                />
                {photo.description && (
                  <p className="mt-1 text-[10px] leading-tight text-gray-600">{photo.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
        Prime Wash Estética de Motos · Documento gerado em {formatDateTime(new Date())}
      </footer>
    </div>
  );
}
