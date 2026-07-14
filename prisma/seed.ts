import { PrismaClient, CylinderTier } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SERVICES: {
  name: string;
  description: string;
  prices: Record<CylinderTier, number>;
}[] = [
  {
    name: "Prime",
    description:
      "Lavagem completa da moto, limpeza e lubrificação de corrente, aplicação de verniz de motor e revitalizador de pneus. Não contempla desmontagem de peças e detalhamento.",
    prices: { BAIXA: 100, MEDIA: 150, ALTA: 180 },
  },
  {
    name: "Cera (adicional Prime)",
    description: "Aplicação de cera - adicional ao pacote Prime.",
    prices: { BAIXA: 40, MEDIA: 40, ALTA: 40 },
  },
  {
    name: "Super Prime",
    description:
      "Lavagem detalhada da moto, limpeza e lubrificação de corrente, aplicação de cera (proteção de até 4 meses), revitalizador de plásticos/borrachas e pneus, verniz de motor.",
    prices: { BAIXA: 200, MEDIA: 280, ALTA: 330 },
  },
  {
    name: "Mega Prime",
    description:
      "Lavagem detalhada, limpeza e lubrificação de corrente, hidratação de banco (couro), descontaminação da pintura, selante cerâmico (proteção de até 12 meses), revitalizadores de plásticos/borrachas e pneus, verniz de motor.",
    prices: { BAIXA: 350, MEDIA: 400, ALTA: 480 },
  },
  {
    name: "Polimento Completo",
    description: "Polimento completo da pintura da moto.",
    prices: { BAIXA: 150, MEDIA: 230, ALTA: 280 },
  },
  {
    name: "Vitrificação",
    description: "Vitrificação da pintura da moto.",
    prices: { BAIXA: 900, MEDIA: 1200, ALTA: 1500 },
  },
];

async function main() {
  for (const [index, service] of SERVICES.entries()) {
    const created = await prisma.service.upsert({
      where: { name: service.name },
      update: {
        description: service.description,
        sortOrder: index,
      },
      create: {
        name: service.name,
        description: service.description,
        sortOrder: index,
      },
    });

    for (const tier of Object.keys(service.prices) as CylinderTier[]) {
      await prisma.servicePrice.upsert({
        where: { serviceId_tier: { serviceId: created.id, tier } },
        update: { price: service.prices[tier] },
        create: { serviceId: created.id, tier, price: service.prices[tier] },
      });
    }
  }

  const adminEmail = "admin@primewash.com.br";
  const adminPassword = "primewash123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed concluído.");
  console.log(`Usuário admin: ${adminEmail} / senha: ${adminPassword}`);
  console.log("Troque a senha após o primeiro login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
