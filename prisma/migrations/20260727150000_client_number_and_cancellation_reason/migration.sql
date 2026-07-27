-- CreateEnum
CREATE TYPE "CancellationReason" AS ENUM ('DESISTIU', 'VALOR', 'IMPREVISTO', 'CHUVA', 'OUTRO');

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN "cancellationReason" "CancellationReason";

-- AlterTable: adiciona número sequencial ao cliente, preenchendo os já existentes por ordem de criação
CREATE SEQUENCE IF NOT EXISTS clients_number_seq;

ALTER TABLE "clients" ADD COLUMN "number" INTEGER;

WITH ordered AS (
  SELECT id, row_number() OVER (ORDER BY "createdAt") AS rn FROM "clients"
)
UPDATE "clients" c SET "number" = ordered.rn
FROM ordered
WHERE c.id = ordered.id;

SELECT setval('clients_number_seq', COALESCE((SELECT MAX("number") FROM "clients"), 0) + 1, false);

ALTER TABLE "clients" ALTER COLUMN "number" SET DEFAULT nextval('clients_number_seq');
ALTER TABLE "clients" ALTER COLUMN "number" SET NOT NULL;
ALTER SEQUENCE clients_number_seq OWNED BY "clients"."number";

CREATE UNIQUE INDEX "clients_number_key" ON "clients"("number");
