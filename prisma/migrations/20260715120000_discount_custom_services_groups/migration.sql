-- CreateTable
CREATE TABLE "service_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_groups_name_key" ON "service_groups"("name");

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "groupId" TEXT;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "service_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "discount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "work_order_services" ADD COLUMN     "customName" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL,
ALTER COLUMN "tier" DROP NOT NULL;
