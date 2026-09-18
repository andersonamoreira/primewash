-- CreateTable
CREATE TABLE "cancellation_reasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellation_reasons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cancellation_reasons_name_key" ON "cancellation_reasons"("name");

-- Seed rows preserving the previous fixed labels/order from the old enum
INSERT INTO "cancellation_reasons" ("id", "name", "sortOrder", "updatedAt") VALUES
  (gen_random_uuid()::text, 'Desistiu', 0, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Valor', 1, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Imprevisto', 2, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Chuva', 3, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Outro', 4, CURRENT_TIMESTAMP);

-- AlterTable: add the new FK column
ALTER TABLE "work_orders" ADD COLUMN "cancellationReasonId" TEXT;

-- Backfill existing rows from the old enum column into the new FK
UPDATE "work_orders" wo
SET "cancellationReasonId" = cr.id
FROM "cancellation_reasons" cr
WHERE wo."cancellationReason" IS NOT NULL
  AND cr.name = CASE wo."cancellationReason"::text
    WHEN 'DESISTIU' THEN 'Desistiu'
    WHEN 'VALOR' THEN 'Valor'
    WHEN 'IMPREVISTO' THEN 'Imprevisto'
    WHEN 'CHUVA' THEN 'Chuva'
    WHEN 'OUTRO' THEN 'Outro'
  END;

-- Drop the old enum column and type
ALTER TABLE "work_orders" DROP COLUMN "cancellationReason";
DROP TYPE "CancellationReason";

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_cancellationReasonId_fkey" FOREIGN KEY ("cancellationReasonId") REFERENCES "cancellation_reasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
