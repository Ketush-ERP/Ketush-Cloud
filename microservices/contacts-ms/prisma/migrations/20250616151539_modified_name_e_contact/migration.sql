/*
  Warnings:

  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Contact";

-- CreateTable
CREATE TABLE "EContact" (
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
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EContact_code_key" ON "EContact"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EContact_cuil_key" ON "EContact"("cuil");
