import Link from "next/link";
import { Plus, Search, Bike, Phone, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { daysSince, relativeDaysLabel } from "@/lib/format";

const SORT_KEYS = ["name", "motos", "lastVisit"] as const;
type SortKey = (typeof SORT_KEYS)[number];

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; dir?: string }>;
}) {
  const { q, sort, dir } = await searchParams;

  const sortKey: SortKey = SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : "name";
  const sortDir: "asc" | "desc" = dir === "desc" ? "desc" : "asc";

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
        where: { status: "CONCLUIDO" },
        orderBy: { finishedAt: "desc" },
        take: 1,
        select: { finishedAt: true },
      },
    },
  });

  const sortedClients = [...clients].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") {
      cmp = a.name.localeCompare(b.name, "pt-BR");
    } else if (sortKey === "motos") {
      cmp = a._count.motorcycles - b._count.motorcycles;
    } else {
      const aTime = a.workOrders[0]?.finishedAt?.getTime() ?? 0;
      const bTime = b.workOrders[0]?.finishedAt?.getTime() ?? 0;
      cmp = aTime - bTime;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  function sortHref(key: SortKey) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("sort", key);
    params.set("dir", sortKey === key && sortDir === "asc" ? "desc" : "asc");
    return `/clientes?${params.toString()}`;
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="size-3.5 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />;
  }

  function SortableHead({ column, children }: { column: SortKey; children: React.ReactNode }) {
    return (
      <TableHead>
        <Link
          href={sortHref(column)}
          className={cn(
            "flex items-center gap-1 transition-colors hover:text-foreground",
            sortKey === column && "text-foreground"
          )}
        >
          {children}
          <SortIcon column={column} />
        </Link>
      </TableHead>
    );
  }

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
                  <SortableHead column="name">Nome</SortableHead>
                  <TableHead>Telefone</TableHead>
                  <SortableHead column="motos">Motos</SortableHead>
                  <SortableHead column="lastVisit">Última visita</SortableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClients.map((client) => {
                  const lastVisit = client.workOrders[0]?.finishedAt;
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
            {sortedClients.map((client) => {
              const lastVisit = client.workOrders[0]?.finishedAt;
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
