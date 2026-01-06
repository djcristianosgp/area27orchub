-- Add companyId to clients for Company relation
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

-- Add foreign key for clients.companyId -> companies.id
DO $$
BEGIN
  BEGIN
    ALTER TABLE "clients" ADD CONSTRAINT "clients_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists; do nothing
    NULL;
  END;
END$$;

-- Add code column to invoices to match Prisma schema
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "code" TEXT;

-- Ensure code is NOT NULL for future inserts; if table is empty, this is safe
ALTER TABLE "invoices" ALTER COLUMN "code" SET NOT NULL;

-- Add unique index for invoices.code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = current_schema() AND indexname = 'invoices_code_key'
  ) THEN
    CREATE UNIQUE INDEX "invoices_code_key" ON "invoices"("code");
  END IF;
END$$;