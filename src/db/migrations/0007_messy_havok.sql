CREATE TABLE "community_attestations" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"review_id" text NOT NULL,
	"subject_user_id" text NOT NULL,
	"witness_user_id" text NOT NULL,
	"relationship" text NOT NULL,
	"witness_city" text NOT NULL,
	"witness_locality" text,
	"witness_postal_code" text,
	"note" text,
	"locality_matched" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "community_attestations" ADD CONSTRAINT "community_attestations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_attestations" ADD CONSTRAINT "community_attestations_review_id_moderation_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."moderation_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_attestations" ADD CONSTRAINT "community_attestations_subject_user_id_users_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_attestations" ADD CONSTRAINT "community_attestations_witness_user_id_users_id_fk" FOREIGN KEY ("witness_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "community_attestations_review_witness_idx" ON "community_attestations" USING btree ("review_id","witness_user_id");--> statement-breakpoint
CREATE INDEX "community_attestations_subject_created_idx" ON "community_attestations" USING btree ("subject_user_id","created_at");--> statement-breakpoint
CREATE INDEX "community_attestations_witness_created_idx" ON "community_attestations" USING btree ("witness_user_id","created_at");