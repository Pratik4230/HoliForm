DROP INDEX "forms_slug_unique";--> statement-breakpoint
DROP INDEX "form_fields_form_id_index_unique";--> statement-breakpoint
ALTER TABLE "form_fields" ALTER COLUMN "index" SET DATA TYPE numeric(20, 10);--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "closed_at" timestamp;