ALTER TABLE "users" ADD COLUMN "username" varchar(32) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");