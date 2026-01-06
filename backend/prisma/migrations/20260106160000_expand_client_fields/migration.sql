-- AlterTable: Expand Client fields
ALTER TABLE "clients" 
ADD COLUMN "nickname" TEXT,
ADD COLUMN "cpf_cnpj" TEXT UNIQUE,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "street" TEXT,
ADD COLUMN "number" TEXT,
ADD COLUMN "neighborhood" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "zip_code" TEXT,
ADD COLUMN "state" TEXT;

-- Drop old columns
ALTER TABLE "clients" DROP COLUMN IF EXISTS "email";
ALTER TABLE "clients" DROP COLUMN IF EXISTS "phone";

-- CreateTable: ClientEmail
CREATE TABLE "client_emails" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ClientPhone
CREATE TABLE "client_phones" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "has_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_phones_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ClientSocialMedia
CREATE TABLE "client_social_media" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_social_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_emails_client_id_email_key" ON "client_emails"("client_id", "email");
CREATE INDEX "client_emails_client_id_idx" ON "client_emails"("client_id");

CREATE UNIQUE INDEX "client_phones_client_id_phone_key" ON "client_phones"("client_id", "phone");
CREATE INDEX "client_phones_client_id_idx" ON "client_phones"("client_id");

CREATE UNIQUE INDEX "client_social_media_client_id_platform_key" ON "client_social_media"("client_id", "platform");
CREATE INDEX "client_social_media_client_id_idx" ON "client_social_media"("client_id");

-- AddForeignKey
ALTER TABLE "client_emails" ADD CONSTRAINT "client_emails_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_phones" ADD CONSTRAINT "client_phones_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_social_media" ADD CONSTRAINT "client_social_media_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
