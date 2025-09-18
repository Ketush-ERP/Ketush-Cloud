/*
  Warnings:

  - You are about to drop the column `installments` on the `ECard` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ECard` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ECard` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ECard_name_idx";

-- AlterTable
ALTER TABLE "ECard" DROP COLUMN "installments",
DROP COLUMN "name",
DROP COLUMN "type";

-- CreateIndex
CREATE INDEX "ECard_id_commissionPercentage_idx" ON "ECard"("id", "commissionPercentage");
