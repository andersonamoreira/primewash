import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";

type QueryClient = PrismaClient | Prisma.TransactionClient;

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/** Procura um cliente já cadastrado com o mesmo telefone ou CPF (comparando só os dígitos,
 * ignorando máscara). Usado em todo ponto que cria/edita cliente, inclusive o atalho de
 * "novo cliente" dentro da abertura de OS, para não deixar duplicar o cadastro. */
export async function findDuplicateClient(
  db: QueryClient,
  phone: string,
  document?: string,
  excludeId?: string
) {
  const normalizedPhone = onlyDigits(phone);
  const normalizedDocument = document ? onlyDigits(document) : undefined;

  const candidates = await db.client.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
    select: { id: true, name: true, phone: true, document: true },
  });

  return candidates.find(
    (c) =>
      onlyDigits(c.phone) === normalizedPhone ||
      (normalizedDocument && c.document && onlyDigits(c.document) === normalizedDocument)
  );
}
