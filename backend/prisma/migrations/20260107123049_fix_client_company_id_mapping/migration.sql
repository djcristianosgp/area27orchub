/*
  Warnings:

  - You are about to drop the column `companyId` on the `clients` table. All the data in the column will be lost.
  - Made the column `primary` on table `company_emails` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hasWhatsapp` on table `company_phones` required. This step will fail if there are existing NULL values in that column.
  - Made the column `primary` on table `company_phones` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_companyId_fkey";

-- DropIndex
DROP INDEX "client_emails_client_id_idx";

-- DropIndex
DROP INDEX "client_phones_client_id_idx";

-- DropIndex
DROP INDEX "client_social_media_client_id_idx";

-- AlterTable
ALTER TABLE "brands" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "companyId",
ADD COLUMN     "company_id" TEXT;

-- AlterTable
ALTER TABLE "company_emails" ALTER COLUMN "primary" SET NOT NULL;

-- AlterTable
ALTER TABLE "company_phones" ALTER COLUMN "hasWhatsapp" SET NOT NULL,
ALTER COLUMN "primary" SET NOT NULL;

-- AlterTable
ALTER TABLE "company_pix_keys" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "groups" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "categoryId" DROP DEFAULT,
ALTER COLUMN "brandId" DROP DEFAULT,
ALTER COLUMN "groupId" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Seed" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Seed_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
