/*
  Warnings:

  - You are about to drop the column `commisionPrice` on the `EProduct` table. All the data in the column will be lost.
  - Added the required column `commissionPrice` to the `EProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EProduct" DROP COLUMN "commisionPrice",
ADD COLUMN     "commissionPrice" TEXT NOT NULL;
