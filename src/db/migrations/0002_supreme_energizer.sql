ALTER TABLE "vote_events" ALTER COLUMN "previous_value" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "vote_events" ALTER COLUMN "new_value" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "votes" ALTER COLUMN "value" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."vote_value";--> statement-breakpoint
CREATE TYPE "public"."vote_value" AS ENUM('not_started', 'started', 'in_progress', 'mostly_done', 'completed');--> statement-breakpoint
ALTER TABLE "vote_events" ALTER COLUMN "previous_value" SET DATA TYPE "public"."vote_value" USING "previous_value"::"public"."vote_value";--> statement-breakpoint
ALTER TABLE "vote_events" ALTER COLUMN "new_value" SET DATA TYPE "public"."vote_value" USING "new_value"::"public"."vote_value";--> statement-breakpoint
ALTER TABLE "votes" ALTER COLUMN "value" SET DATA TYPE "public"."vote_value" USING "value"::"public"."vote_value";--> statement-breakpoint
ALTER TABLE "timelines" ADD COLUMN "results_published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "timelines" ADD COLUMN "term_start_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vote_snapshots" ADD COLUMN "total_votes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vote_snapshots" ADD COLUMN "completion_percent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vote_snapshots" DROP COLUMN "upvotes";--> statement-breakpoint
ALTER TABLE "vote_snapshots" DROP COLUMN "downvotes";--> statement-breakpoint
ALTER TABLE "vote_snapshots" DROP COLUMN "score";