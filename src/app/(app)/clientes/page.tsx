import Link from "next/link";
import { Plus, Search, Bike, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { daysSince, relativeDaysLabel } from "@/lib/format";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { motorcycles: true } },
      workOrders: {
        orderBy: { scheduledAt: "desc" },
        take: 1,
        select: { scheduledAt: true, status: true },
      },
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clients.length} cliente(s) cadastrado(s)</p>
        </div>
        <Button asChild>
          <Link href="/clientes/novo">
            <Plus className="size-4" /> Novo cliente
          </Link>
        </Button>
      </div>

      <form className="mb-5 flex max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Buscar por nome ou telefone" className="pl-9" />
        </div>
      </form>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong p-10 text-center text-muted-foreground">
          Nenhum cliente encontrado.
        </div>
      ) : (
        <>
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Motos</TableHead>
                  <TableHead>Última visita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => {
                  const lastVisit = client.workOrders[0]?.scheduledAt;
                  return (
                    <TableRow key={client.id} className="cursor-pointer">
                      <TableCell>
                        <Link href={`/clientes/${client.id}`} className="font-medium text-foreground hover:text-primary">
                          {client.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{client.phone}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Bike className="size-3" /> {client._count.motorcycles}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lastVisit ? relativeDaysLabel(daysSince(lastVisit)) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 sm:hidden">
            {clients.map((client) => {
              const lastVisit = client.workOrders[0]?.scheduledAt;
              return (
                <Link
                  key={client.id}
                  href={`/clientes/${client.id}`}
                  className="rounded-lg border border-border-subtle bg-surface p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{client.name}</span>
                    <Badge variant="secondary">
                      <Bike className="size-3" /> {client._count.motorcycles}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="size-3.5" /> {client.phone}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Última visita: {lastVisit ? relativeDaysLabel(daysSince(lastVisit)) : "—"}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
