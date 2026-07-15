import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";

export default async function NewWorkOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;

  const [clients, services] = await Promise.all([
    prisma.client.findMany({
      orderBy: { name: "asc" },
      include: {
        motorcycles: {
          select: { id: true, brand: true, model: true, plate: true, cylinderTier: true },
        },
      },
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { prices: true, group: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/ordens"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-foreground">Nova ordem de serviço</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Registre a recepção da moto e os serviços contratados.
      </p>

      <WorkOrderForm
        clients={clients.map((c) => ({
          ...c,
          motorcycles: c.motorcycles.map((m) => ({ ...m })),
        }))}
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          groupName: s.group?.name ?? null,
          prices: s.prices.map((p) => ({ tier: p.tier, price: p.price.toString() })),
        }))}
        initialClientId={clientId}
      />
    </div>
  );
}
