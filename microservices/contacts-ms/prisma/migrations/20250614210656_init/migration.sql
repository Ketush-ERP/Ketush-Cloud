-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('CLIENT', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "IvaCondition" AS ENUM ('RESPONSABLE_INSCRIPTO', 'MONOTRIBUTO', 'EXENTO', 'CONSUMIDOR_FINAL', 'NO_RESPONSABLE');

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "cuil" TEXT NOT NULL,
    "ivaCondition" "IvaCondition" NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "type" "ContactType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_code_key" ON "Contact"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_cuil_key" ON "Contact"("cuil");
