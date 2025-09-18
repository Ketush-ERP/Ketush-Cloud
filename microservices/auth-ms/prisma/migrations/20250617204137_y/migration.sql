-- AlterTable
ALTER TABLE "User" ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "User_id_name_available_idx" ON "User"("id", "name", "available");
