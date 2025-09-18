/*
  Warnings:

  - You are about to drop the column `cuil` on the `EContact` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentNumber]` on the table `EContact` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documentNumber` to the `EContact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentType` to the `EContact` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DNI', 'CUIL', 'CUIT');

-- DropIndex
DROP INDEX "EContact_cuil_key";

-- AlterTable
ALTER TABLE "EContact" DROP COLUMN "cuil",
ADD COLUMN     "documentNumber" TEXT NOT NULL,
ADD COLUMN     "documentType" "DocumentType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EContact_documentNumber_key" ON "EContact"("documentNumber");
