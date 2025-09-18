-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('FACTURA_A', 'FACTURA_B', 'NOTA_CREDITO_A', 'NOTA_CREDITO_B', 'NOTA_DEBITO_A', 'NOTA_DEBITO_B', 'PRESUPUESTO');

-- CreateEnum
CREATE TYPE "ConditionPayment" AS ENUM ('CASH', 'CREDIT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'DOLAR', 'CHEQUE', 'TRANSFERENCIA', 'TARJETA');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('PENDING', 'SENT', 'REJECTED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('ARS', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('CREDIT', 'DEBIT', 'PREPAID');

-- CreateTable
CREATE TABLE "EVoucher" (
    "id" TEXT NOT NULL,
    "arcaCae" TEXT,
    "arcaDueDate" TEXT,
    "type" "VoucherType" NOT NULL,
    "pointOfSale" INTEGER NOT NULL,
    "voucherNumber" INTEGER NOT NULL,
    "emissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "status" "VoucherStatus" NOT NULL DEFAULT 'PENDING',
    "contactId" TEXT,
    "conditionPayment" "ConditionPayment",
    "totalAmount" DOUBLE PRECISION,
    "ivaAmount" DOUBLE PRECISION,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observation" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "afipRequestData" JSONB,
    "afipResponseData" JSONB,
    "associatedVoucherNumber" DOUBLE PRECISION,
    "associatedVoucherType" "VoucherType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EVoucherProduct" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EVoucherProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EBank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "account" TEXT,
    "cbu" TEXT,
    "currency" "Currency" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ECard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "installments" INTEGER NOT NULL,
    "type" "CardType",
    "available" BOOLEAN NOT NULL DEFAULT true,
    "commissionPercentage" INTEGER,

    CONSTRAINT "ECard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EPayment" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bankId" TEXT,
    "cardId" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EVoucher_type_emissionDate_idx" ON "EVoucher"("type", "emissionDate");

-- CreateIndex
CREATE INDEX "EVoucher_contactId_status_idx" ON "EVoucher"("contactId", "status");

-- CreateIndex
CREATE INDEX "EVoucherProduct_voucherId_productId_idx" ON "EVoucherProduct"("voucherId", "productId");

-- CreateIndex
CREATE INDEX "EBank_name_currency_idx" ON "EBank"("name", "currency");

-- CreateIndex
CREATE INDEX "ECard_name_idx" ON "ECard"("name");

-- CreateIndex
CREATE INDEX "EPayment_voucherId_method_idx" ON "EPayment"("voucherId", "method");

-- CreateIndex
CREATE INDEX "EPayment_receivedAt_idx" ON "EPayment"("receivedAt");

-- AddForeignKey
ALTER TABLE "EVoucherProduct" ADD CONSTRAINT "EVoucherProduct_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "EVoucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EPayment" ADD CONSTRAINT "EPayment_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "EVoucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EPayment" ADD CONSTRAINT "EPayment_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "EBank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EPayment" ADD CONSTRAINT "EPayment_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "ECard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
