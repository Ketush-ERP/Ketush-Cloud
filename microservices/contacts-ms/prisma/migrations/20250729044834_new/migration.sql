/*
  Warnings:

  - The `code` column on the `EContact` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ESupplierProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ESupplierProduct" DROP CONSTRAINT "ESupplierProduct_supplierId_fkey";

-- AlterTable
ALTER TABLE "EContact" DROP COLUMN "code",
ADD COLUMN     "code" SERIAL NOT NULL;

-- DropTable
DROP TABLE "ESupplierProduct";

-- CreateIndex
CREATE UNIQUE INDEX "EContact_code_key" ON "EContact"("code");
