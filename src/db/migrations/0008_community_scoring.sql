CREATE TYPE "public"."score_event_type" AS ENUM('email_verified', 'account_age', 'account_state', 'vote_cast', 'vote_aligned', 'flag_acted', 'witnessed_approval', 'endorsement_received', 'endorsement_withdrawn', 'abuse_flag', 'review_opened', 'review_closed', 'suspension');--> statement-breakpoint
CREATE TYPE "public"."endorsement_status" AS ENUM('active', 'withdrawn');--> statement-breakpoint
CREATE TABLE "user_score_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"event_type" "score_event_type" NOT NULL,
	"delta" integer NOT NULL,
	"reference_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_endorsements" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"endorser_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"note" text,
	"status" "endorsement_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_score_events" ADD CONSTRAINT "user_score_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_score_events" ADD CONSTRAINT "user_score_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_endorsements" ADD CONSTRAINT "community_endorsements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_endorsements" ADD CONSTRAINT "community_endorsements_endorser_id_users_id_fk" FOREIGN KEY ("endorser_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_endorsements" ADD CONSTRAINT "community_endorsements_subject_id_users_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_score_events_user_tenant_created_idx" ON "user_score_events" USING btree ("user_id","tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "user_score_events_tenant_type_created_idx" ON "user_score_events" USING btree ("tenant_id","event_type","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "community_endorsements_endorser_subject_idx" ON "community_endorsements" USING btree ("endorser_id","subject_id");--> statement-breakpoint
CREATE INDEX "community_endorsements_subject_tenant_idx" ON "community_endorsements" USING btree ("subject_id","tenant_id");
