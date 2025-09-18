-- CreateIndex
CREATE INDEX "EContact_id_available_name_documentNumber_idx" ON "EContact"("id", "available", "name", "documentNumber");
