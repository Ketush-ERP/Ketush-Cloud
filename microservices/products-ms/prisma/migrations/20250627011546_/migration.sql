/*
  Warnings:

  - Added the required column `supplierId` to the `EProduct` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EProduct_available_idx";

-- AlterTable
ALTER TABLE "EProduct" ADD COLUMN     "supplierId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "EBrand_id_name_available_idx" ON "EBrand"("id", "name", "available");

-- CreateIndex
CREATE INDEX "EProduct_available_description_supplierId_idx" ON "EProduct"("available", "description", "supplierId");
