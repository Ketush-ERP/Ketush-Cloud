/*
  Warnings:

  - You are about to drop the column `branchId` on the `EContact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EContact" DROP COLUMN "branchId",
ADD COLUMN     "profitMargin" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ESupplierProduct" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ESupplierProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ESupplierProduct_supplierId_productId_idx" ON "ESupplierProduct"("supplierId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ESupplierProduct_supplierId_productId_key" ON "ESupplierProduct"("supplierId", "productId");

-- AddForeignKey
ALTER TABLE "ESupplierProduct" ADD CONSTRAINT "ESupplierProduct_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "EContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
