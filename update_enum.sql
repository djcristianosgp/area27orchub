ALTER TABLE "invoices" ADD COLUMN "status_new" VARCHAR(255) DEFAULT 'DRAFT';
UPDATE "invoices" SET "status_new" = 
  CASE 
    WHEN "status"::text = 'SENT' THEN 'READY'
    WHEN "status"::text = 'DRAFT' THEN 'DRAFT'
    WHEN "status"::text = 'APPROVED' THEN 'APPROVED'
    WHEN "status"::text = 'REFUSED' THEN 'REFUSED'
    ELSE 'DRAFT'
  END;
ALTER TABLE "invoices" DROP COLUMN "status";
ALTER TABLE "invoices" RENAME COLUMN "status_new" TO "status";
DROP TYPE "InvoiceStatus";
CREATE TYPE "InvoiceStatus" AS ENUM('DRAFT', 'READY', 'EXPIRED', 'APPROVED', 'REFUSED', 'COMPLETED', 'INVOICED', 'ABANDONED', 'DESISTED');
ALTER TABLE "invoices" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "invoices" ALTER COLUMN "status" TYPE "InvoiceStatus" USING "status"::"InvoiceStatus";
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"InvoiceStatus";
