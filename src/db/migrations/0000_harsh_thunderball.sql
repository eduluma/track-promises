CREATE TYPE "public"."account_state" AS ENUM('pending', 'verified', 'limited', 'suspended', 'moderator_approved');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('open', 'in_review', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."moderation_subject_type" AS ENUM('account', 'vote', 'source', 'promise');--> statement-breakpoint
CREATE TYPE "public"."promise_status" AS ENUM('planned', 'in_progress', 'fulfilled', 'delayed', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."source_verification_status" AS ENUM('verified', 'pending');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'editor', 'moderator', 'tenant_admin', 'platform_admin');--> statement-breakpoint
CREATE TYPE "public"."vote_value" AS ENUM('up', 'down');--> statement-breakpoint
CREATE TYPE "public"."voting_scope_type" AS ENUM('platform', 'tenant', 'election', 'promise');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text,
	"actor_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"subject_type" "moderation_subject_type" NOT NULL,
	"subject_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" "moderation_status" DEFAULT 'open' NOT NULL,
	"assigned_moderator_id" text,
	"decision" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promise_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"promise_id" text NOT NULL,
	"url" text NOT NULL,
	"publisher" text NOT NULL,
	"excerpt" text NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"verification_status" "source_verification_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promise_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"promise_id" text NOT NULL,
	"previous_status" "promise_status",
	"new_status" "promise_status" NOT NULL,
	"changed_by" text,
	"reason" text NOT NULL,
	"source_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promises" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"jurisdiction" text NOT NULL,
	"election" text NOT NULL,
	"person_party" text NOT NULL,
	"status" "promise_status" DEFAULT 'planned' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"config_key" text NOT NULL,
	"config_value" jsonb NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"jurisdiction_type" text NOT NULL,
	"primary_domain" text NOT NULL,
	"tagline" text NOT NULL,
	"brand_color" text NOT NULL,
	"default_locale" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"state" "account_state" DEFAULT 'pending' NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"trust_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vote_events" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"promise_id" text NOT NULL,
	"user_id" text NOT NULL,
	"previous_value" "vote_value",
	"new_value" "vote_value" NOT NULL,
	"event_type" text NOT NULL,
	"request_metadata_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vote_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"promise_id" text NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"snapshot_at" timestamp with time zone NOT NULL,
	"generation_source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"promise_id" text NOT NULL,
	"user_id" text NOT NULL,
	"value" "vote_value" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voting_windows" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"scope_type" "voting_scope_type" NOT NULL,
	"scope_id" text,
	"start_at" timestamp with time zone NOT NULL,
	"freeze_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_reviews" ADD CONSTRAINT "moderation_reviews_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_reviews" ADD CONSTRAINT "moderation_reviews_assigned_moderator_id_users_id_fk" FOREIGN KEY ("assigned_moderator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promise_sources" ADD CONSTRAINT "promise_sources_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promise_sources" ADD CONSTRAINT "promise_sources_promise_id_promises_id_fk" FOREIGN KEY ("promise_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promise_status_history" ADD CONSTRAINT "promise_status_history_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promise_status_history" ADD CONSTRAINT "promise_status_history_promise_id_promises_id_fk" FOREIGN KEY ("promise_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promise_status_history" ADD CONSTRAINT "promise_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promise_status_history" ADD CONSTRAINT "promise_status_history_source_id_promise_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."promise_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promises" ADD CONSTRAINT "promises_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promises" ADD CONSTRAINT "promises_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_configs" ADD CONSTRAINT "tenant_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_configs" ADD CONSTRAINT "tenant_configs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_events" ADD CONSTRAINT "vote_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_events" ADD CONSTRAINT "vote_events_promise_id_promises_id_fk" FOREIGN KEY ("promise_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_events" ADD CONSTRAINT "vote_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_snapshots" ADD CONSTRAINT "vote_snapshots_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_snapshots" ADD CONSTRAINT "vote_snapshots_promise_id_promises_id_fk" FOREIGN KEY ("promise_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_promise_id_promises_id_fk" FOREIGN KEY ("promise_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voting_windows" ADD CONSTRAINT "voting_windows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_entity_created_idx" ON "audit_logs" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "moderation_reviews_tenant_status_created_idx" ON "moderation_reviews" USING btree ("tenant_id","status","created_at");--> statement-breakpoint
CREATE INDEX "promise_sources_promise_idx" ON "promise_sources" USING btree ("promise_id");--> statement-breakpoint
CREATE INDEX "promise_status_history_promise_created_idx" ON "promise_status_history" USING btree ("promise_id","created_at");--> statement-breakpoint
CREATE INDEX "promises_tenant_category_status_idx" ON "promises" USING btree ("tenant_id","category","status");--> statement-breakpoint
CREATE INDEX "promises_tenant_jurisdiction_election_idx" ON "promises" USING btree ("tenant_id","jurisdiction","election");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_configs_key_idx" ON "tenant_configs" USING btree ("tenant_id","config_key");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_primary_domain_idx" ON "tenants" USING btree ("primary_domain");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "vote_events_promise_created_idx" ON "vote_events" USING btree ("promise_id","created_at");--> statement-breakpoint
CREATE INDEX "vote_snapshots_promise_snapshot_idx" ON "vote_snapshots" USING btree ("promise_id","snapshot_at");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_promise_user_idx" ON "votes" USING btree ("promise_id","user_id");--> statement-breakpoint
CREATE INDEX "votes_promise_updated_idx" ON "votes" USING btree ("promise_id","updated_at");--> statement-breakpoint
CREATE INDEX "voting_windows_scope_idx" ON "voting_windows" USING btree ("tenant_id","scope_type","scope_id");