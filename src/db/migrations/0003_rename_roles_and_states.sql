-- Rename account_state enum values
ALTER TYPE "public"."account_state" RENAME VALUE 'pending' TO 'unverified';--> statement-breakpoint
ALTER TYPE "public"."account_state" RENAME VALUE 'limited' TO 'readonly';--> statement-breakpoint
-- Rename user_role enum value
ALTER TYPE "public"."user_role" RENAME VALUE 'editor' TO 'promise_editor';--> statement-breakpoint
-- Add guest role for unregistered-user vote tracking
ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'guest';
