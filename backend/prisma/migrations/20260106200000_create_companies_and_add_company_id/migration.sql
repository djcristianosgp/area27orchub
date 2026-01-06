-- CreateTable "companies"
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "cpf_cnpj" TEXT UNIQUE,
    "street" TEXT,
    "number" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "zip_code" TEXT,
    "state" TEXT,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable "company_emails"
CREATE TABLE "company_emails" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "primary" BOOLEAN DEFAULT false,
    "companyId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_emails_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "company_emails_companyId_email_key" UNIQUE ("companyId", "email")
);

-- CreateTable "company_phones"
CREATE TABLE "company_phones" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "hasWhatsapp" BOOLEAN DEFAULT false,
    "primary" BOOLEAN DEFAULT false,
    "companyId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_phones_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "company_phones_companyId_phone_key" UNIQUE ("companyId", "phone")
);

-- CreateTable "company_socials"
CREATE TABLE "company_socials" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_socials_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "company_socials_companyId_platform_key" UNIQUE ("companyId", "platform")
);

-- CreateTable "company_pix_keys"
CREATE TABLE "company_pix_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pix_keys_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "company_pix_keys_companyId_key_key" UNIQUE ("companyId", "key")
);

-- AddColumn company_id to users
ALTER TABLE "users" ADD COLUMN "company_id" TEXT;

-- AddForeignKey
ALTER TABLE "company_emails" ADD CONSTRAINT "company_emails_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_phones" ADD CONSTRAINT "company_phones_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_socials" ADD CONSTRAINT "company_socials_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_pix_keys" ADD CONSTRAINT "company_pix_keys_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
