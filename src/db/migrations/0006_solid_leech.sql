ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "users"
SET "phone" = '+' || substring("email" from '^phone:([0-9]+)@signup\\.local$')
WHERE "phone" IS NULL
	AND "email" ~ '^phone:[0-9]+@signup\\.local$';--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_idx" ON "users" USING btree ("phone");