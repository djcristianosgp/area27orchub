-- Update Client-ClientEmail relationship
ALTER TABLE "client_emails" DROP CONSTRAINT "client_emails_client_id_fkey";
ALTER TABLE "client_emails" ADD CONSTRAINT "client_emails_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update Client-ClientPhone relationship  
ALTER TABLE "client_phones" DROP CONSTRAINT "client_phones_client_id_fkey";
ALTER TABLE "client_phones" ADD CONSTRAINT "client_phones_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update Client-ClientSocialMedia relationship
ALTER TABLE "client_social_media" DROP CONSTRAINT "client_social_media_client_id_fkey";
ALTER TABLE "client_social_media" ADD CONSTRAINT "client_social_media_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
