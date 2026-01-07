-- AlterTable Invoice - Adicionar novos campos
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "proposal_valid_date" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "origin" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "observations" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "responsible" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "internal_reference" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "discounts" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "additions" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "displacement" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "final_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "public_url_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "client_response_reason" TEXT;

-- AlterTable InvoiceItem - Adicionar campos de customização
ALTER TABLE "invoice_items" ADD COLUMN IF NOT EXISTS "custom_name" TEXT;
ALTER TABLE "invoice_items" ADD COLUMN IF NOT EXISTS "custom_description" TEXT;
ALTER TABLE "invoice_items" ADD COLUMN IF NOT EXISTS "custom_price" DECIMAL(10,2);

-- Atualizar final_amount para invoices existentes
UPDATE "invoices" SET "final_amount" = "totalAmount" WHERE "final_amount" = 0;
