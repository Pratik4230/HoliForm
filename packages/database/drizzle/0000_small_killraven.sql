CREATE TYPE "public"."form_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."form_visibility" AS ENUM('public', 'unlisted');--> statement-breakpoint
CREATE TYPE "public"."form_field_type" AS ENUM('text', 'textarea', 'email', 'number', 'phone', 'date', 'checkbox', 'radio', 'select', 'multiselect');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(32) NOT NULL,
	"full_name" varchar(80) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"email_notifications_enabled" boolean DEFAULT true NOT NULL,
	"profile_image_url" text,
	"salt" text,
	"password" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "email_verification_otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "form_themes" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"category" varchar(64) NOT NULL,
	"config" jsonb NOT NULL,
	"is_preset" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"slug" varchar(128) NOT NULL,
	"status" "form_status" DEFAULT 'draft' NOT NULL,
	"visibility" "form_visibility" DEFAULT 'unlisted' NOT NULL,
	"theme_id" varchar(64),
	"thank_you_message" text DEFAULT 'Thank you for your response!',
	"closed_at" timestamp,
	"expires_at" timestamp,
	"max_responses" integer,
	"archived_at" timestamp,
	"access_password_salt" text,
	"access_password_hash" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"label" varchar(255) NOT NULL,
	"label_key" varchar(255) NOT NULL,
	"description" text,
	"placeholder" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"index" numeric(20, 10) NOT NULL,
	"page_index" integer DEFAULT 0 NOT NULL,
	"type" "form_field_type" NOT NULL,
	"options" jsonb,
	"validation_rules" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "form_response_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"respondent_ip" varchar(45),
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "email_verification_otps" ADD CONSTRAINT "email_verification_otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_theme_id_form_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."form_themes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_response_answers" ADD CONSTRAINT "form_response_answers_response_id_form_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."form_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_response_answers" ADD CONSTRAINT "form_response_answers_field_id_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "email_verification_otps_user_id_idx" ON "email_verification_otps" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "forms_user_id_slug_unique" ON "forms" USING btree ("user_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "form_fields_form_id_label_key_unique" ON "form_fields" USING btree ("form_id","label_key");