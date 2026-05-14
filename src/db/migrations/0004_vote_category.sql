-- Add vote_category to votes and vote_events tables
-- Existing rows are registered users so default to 'verified'
ALTER TABLE "votes" ADD COLUMN IF NOT EXISTS "vote_category" text NOT NULL DEFAULT 'verified';--> statement-breakpoint
ALTER TABLE "vote_events" ADD COLUMN IF NOT EXISTS "vote_category" text NOT NULL DEFAULT 'verified';
