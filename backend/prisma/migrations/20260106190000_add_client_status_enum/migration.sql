-- Create the enum type
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- Create temporary column without default
ALTER TABLE "clients" ADD COLUMN "status_new" "ClientStatus";

-- Copy data from old column to new column
UPDATE "clients" SET "status_new" = CASE 
WHEN "status" = 'ACTIVE' THEN 'ACTIVE'::"ClientStatus"
WHEN "status" = 'INACTIVE' THEN 'INACTIVE'::"ClientStatus"
WHEN "status" = 'BLOCKED' THEN 'BLOCKED'::"ClientStatus"
ELSE 'ACTIVE'::"ClientStatus"
END;

-- Set not null and add default
ALTER TABLE "clients" ALTER COLUMN "status_new" SET NOT NULL;
ALTER TABLE "clients" ALTER COLUMN "status_new" SET DEFAULT 'ACTIVE'::"ClientStatus";

-- Drop the old column
ALTER TABLE "clients" DROP COLUMN "status";

-- Rename new column to original name
ALTER TABLE "clients" RENAME COLUMN "status_new" TO "status";
