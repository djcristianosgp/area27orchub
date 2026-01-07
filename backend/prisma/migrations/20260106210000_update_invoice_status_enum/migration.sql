-- Step 1: Create a backup column with the new enum type
ALTER TABLE "invoices" ADD COLUMN "status_new" TEXT DEFAULT 'DRAFT';

-- Step 2: Copy values from old column to new (handling old values)
UPDATE "invoices" SET "status_new" = 
  CASE 
    WHEN "status" = 'SENT' THEN 'READY'
    WHEN "status" = 'DRAFT' THEN 'DRAFT'
    WHEN "status" = 'APPROVED' THEN 'APPROVED'
    WHEN "status" = 'REFUSED' THEN 'REFUSED'
    ELSE 'DRAFT'
  END;

-- Step 3: Drop the old constraint and column
ALTER TABLE "invoices" DROP COLUMN "status";

-- Step 4: Rename the new column to original name
ALTER TABLE "invoices" RENAME COLUMN "status_new" TO "status";

-- Step 5: Alter the column to add proper constraint
ALTER TABLE "invoices" ALTER COLUMN "status" SET NOT NULL;

-- Step 6: Create new enum type
CREATE TYPE "InvoiceStatus_new" AS ENUM('DRAFT', 'READY', 'EXPIRED', 'APPROVED', 'REFUSED', 'COMPLETED', 'INVOICED', 'ABANDONED', 'DESISTED');

-- Step 7: Cast the column to new enum type (remove default before casting)
ALTER TABLE "invoices" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "invoices" ALTER COLUMN "status" TYPE "InvoiceStatus_new" USING "status"::"InvoiceStatus_new";

-- Step 8: Re-add default after casting
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"InvoiceStatus_new";

-- Step 8: Drop the old enum
DROP TYPE "InvoiceStatus";

-- Step 9: Rename the new enum back to original name
ALTER TYPE "InvoiceStatus_new" RENAME TO "InvoiceStatus";
