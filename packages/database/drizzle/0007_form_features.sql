ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "max_responses" integer;
ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "archived_at" timestamp;
ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "access_password_salt" text;
ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "access_password_hash" text;
ALTER TABLE "form_fields" ADD COLUMN IF NOT EXISTS "page_index" integer DEFAULT 0 NOT NULL;
