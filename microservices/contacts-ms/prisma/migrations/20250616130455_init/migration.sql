/*
  Warnings:

  - The values [MONOTRIBUTO,NO_RESPONSABLE] on the enum `IvaCondition` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IvaCondition_new" AS ENUM ('RESPONSABLE_INSCRIPTO', 'MONOTRIBUTISTA', 'EXENTO', 'CONSUMIDOR_FINAL', 'SUJETO_NO_CATEGORIZADO', 'PROVEEDOR_DEL_EXTERIOR', 'CLIENTE_DEL_EXTERIOR', 'IVA_LIBERADO_LEY_19640', 'IVA_NO_ALCANZADO');
ALTER TABLE "Contact" ALTER COLUMN "ivaCondition" TYPE "IvaCondition_new" USING ("ivaCondition"::text::"IvaCondition_new");
ALTER TYPE "IvaCondition" RENAME TO "IvaCondition_old";
ALTER TYPE "IvaCondition_new" RENAME TO "IvaCondition";
DROP TYPE "IvaCondition_old";
COMMIT;
