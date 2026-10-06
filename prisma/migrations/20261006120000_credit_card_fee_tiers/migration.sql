-- CreateTable
CREATE TABLE "credit_card_fee_tiers" (
    "id" TEXT NOT NULL,
    "minInstallments" INTEGER NOT NULL,
    "maxInstallments" INTEGER NOT NULL,
    "feePercent" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_card_fee_tiers_pkey" PRIMARY KEY ("id")
);

-- Seed default tiers (matches the rates the shop pays today)
INSERT INTO "credit_card_fee_tiers" ("id", "minInstallments", "maxInstallments", "feePercent", "updatedAt") VALUES
  (gen_random_uuid()::text, 1, 1, 4.98, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 2, 6, 2.99, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 7, 12, 3.09, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN "installments" INTEGER;
ALTER TABLE "work_orders" ADD COLUMN "cardFeePercent" DECIMAL(5,2);
