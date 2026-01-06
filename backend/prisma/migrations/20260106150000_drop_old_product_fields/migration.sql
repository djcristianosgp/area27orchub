-- Drop old product fields
ALTER TABLE "products" DROP COLUMN IF EXISTS "category";
ALTER TABLE "products" DROP COLUMN IF EXISTS "brand";
ALTER TABLE "products" DROP COLUMN IF EXISTS "group";
