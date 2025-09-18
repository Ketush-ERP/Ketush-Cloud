/*
  Warnings:

  - Added the required column `basePrice` to the `EProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EProduct" ADD COLUMN     "basePrice" TEXT NOT NULL;
