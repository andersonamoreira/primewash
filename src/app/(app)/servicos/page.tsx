import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceDialog } from "@/components/services/service-dialog";
import { ServiceActiveSwitch } from "@/components/services/service-active-switch";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteServiceAction } from "@/lib/actions/services";
import { CYLINDER_TIER_LABELS, formatCurrency } from "@/lib/format";

export default async function ServicesPage() {
  const [services, groups] = await Promise.all([
    prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
      include: { prices: true, group: true },
    }),
    prisma.serviceGroup.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const groupOptions = groups.map((g) => ({ id: g.id, name: g.name }));

  const servicesByGroup = new Map<string, typeof services>();
  for (const service of services) {
    const key = service.group?.name ?? "Sem grupo";
    if (!servicesByGroup.has(key)) servicesByGroup.set(key, []);
    servicesByGroup.get(key)!.push(service);
  }
  const orderedGroupNames = [...groups.map((g) => g.name), "Sem grupo"].filter((name) =>
    servicesByGroup.has(name)
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços &amp; Preços</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo de serviços oferecidos, com preço por categoria de cilindrada.
          </p>
        </div>
        <ServiceDialog mode="create" groups={groupOptions} />
      </div>

      <div className="flex flex-col gap-8">
        {orderedGroupNames.map((groupName) => (
          <section key={groupName}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {groupName}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {servicesByGroup.get(groupName)!.map((service) => (
                <Card key={service.id} className={!service.active ? "opacity-60" : undefined}>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        {service.description && (
                          <p className="mt-0.5 text-sm text-muted-foreground">{service.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <ServiceDialog
                          mode="edit"
                          groups={groupOptions}
                          service={{
                            ...service,
                            prices: service.prices.map((p) => ({ tier: p.tier, price: p.price.toString() })),
                          }}
                        />
                        <DeleteButton
                          confirmMessage={`Excluir o serviço "${service.name}"? Isso não afeta OS já criadas.`}
                          action={deleteServiceAction.bind(null, service.id)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {service.prices.map((price) => (
                        <Badge key={price.tier} variant="secondary">
                          {CYLINDER_TIER_LABELS[price.tier]}: {formatCurrency(price.price.toString())}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 border-t border-border-subtle pt-3">
                      <ServiceActiveSwitch serviceId={service.id} active={service.active} />
                      <span className="text-xs text-muted-foreground">
                        {service.active ? "Disponível para novas OS" : "Inativo"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
