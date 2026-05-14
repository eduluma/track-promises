DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'account_state' AND e.enumlabel = 'pending'
    ) THEN
        ALTER TYPE "public"."account_state" RENAME VALUE 'pending' TO 'unverified';
    END IF;
END $$;--> statement-breakpoint

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'account_state' AND e.enumlabel = 'limited'
    ) THEN
        ALTER TYPE "public"."account_state" RENAME VALUE 'limited' TO 'readonly';
    END IF;
END $$;--> statement-breakpoint

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'user_role' AND e.enumlabel = 'editor'
    ) THEN
        ALTER TYPE "public"."user_role" RENAME VALUE 'editor' TO 'promise_editor';
    END IF;
END $$;--> statement-breakpoint

ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'guest';--> statement-breakpoint
ALTER TABLE "votes" ADD COLUMN IF NOT EXISTS "vote_category" text NOT NULL DEFAULT 'verified';--> statement-breakpoint
ALTER TABLE "vote_events" ADD COLUMN IF NOT EXISTS "vote_category" text NOT NULL DEFAULT 'verified';