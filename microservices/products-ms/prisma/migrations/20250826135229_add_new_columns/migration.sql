/*
  Warnings:

  - Added the required column `cardId` to the `EProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commisionPrice` to the `EProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EProduct" ADD COLUMN     "cardId" TEXT NOT NULL,
ADD COLUMN     "commisionPrice" TEXT NOT NULL,
ADD COLUMN     "commissionPercentage" DOUBLE PRECISION DEFAULT 0.0;
