ALTER TABLE "form_fields" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
UPDATE "form_fields" SET "type" = 'text' WHERE "type" = 'time';--> statement-breakpoint
UPDATE "form_fields" SET "type" = 'number' WHERE "type" = 'rating';--> statement-breakpoint
DROP TYPE "public"."form_field_type";--> statement-breakpoint
CREATE TYPE "public"."form_field_type" AS ENUM('text', 'textarea', 'email', 'number', 'phone', 'date', 'checkbox', 'radio', 'select', 'multiselect');--> statement-breakpoint
ALTER TABLE "form_fields" ALTER COLUMN "type" SET DATA TYPE "public"."form_field_type" USING "type"::"public"."form_field_type";