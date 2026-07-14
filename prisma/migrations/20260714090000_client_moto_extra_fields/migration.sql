-- CreateEnum
CREATE TYPE "ReferralSource" AS ENUM ('INSTAGRAM', 'INDICACAO', 'CARTAO_VISITA', 'FACHADA');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "referralSource" "ReferralSource";

-- AlterTable
ALTER TABLE "motorcycles" ADD COLUMN     "notes" TEXT;
