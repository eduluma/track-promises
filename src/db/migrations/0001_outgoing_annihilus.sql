CREATE TABLE "alliances" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"alliance_type" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_alliances" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"timeline_id" text NOT NULL,
	"alliance_id" text NOT NULL,
	"ballot_label" text,
	"manifesto_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timelines" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"slug" text NOT NULL,
	"year" integer NOT NULL,
	"title" text NOT NULL,
	"election_label" text NOT NULL,
	"summary" text NOT NULL,
	"office_title" text NOT NULL,
	"office_holder" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "promises" ADD COLUMN "timeline_id" text;--> statement-breakpoint
ALTER TABLE "promises" ADD COLUMN "timeline_alliance_id" text;--> statement-breakpoint
ALTER TABLE "alliances" ADD CONSTRAINT "alliances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_alliances" ADD CONSTRAINT "timeline_alliances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_alliances" ADD CONSTRAINT "timeline_alliances_timeline_id_timelines_id_fk" FOREIGN KEY ("timeline_id") REFERENCES "public"."timelines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_alliances" ADD CONSTRAINT "timeline_alliances_alliance_id_alliances_id_fk" FOREIGN KEY ("alliance_id") REFERENCES "public"."alliances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timelines" ADD CONSTRAINT "timelines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alliances_tenant_slug_idx" ON "alliances" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "timeline_alliances_timeline_alliance_idx" ON "timeline_alliances" USING btree ("timeline_id","alliance_id");--> statement-breakpoint
CREATE INDEX "timeline_alliances_tenant_timeline_idx" ON "timeline_alliances" USING btree ("tenant_id","timeline_id");--> statement-breakpoint
CREATE UNIQUE INDEX "timelines_tenant_slug_idx" ON "timelines" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "timelines_tenant_year_idx" ON "timelines" USING btree ("tenant_id","year");--> statement-breakpoint
ALTER TABLE "promises" ADD CONSTRAINT "promises_timeline_id_timelines_id_fk" FOREIGN KEY ("timeline_id") REFERENCES "public"."timelines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promises" ADD CONSTRAINT "promises_timeline_alliance_id_timeline_alliances_id_fk" FOREIGN KEY ("timeline_alliance_id") REFERENCES "public"."timeline_alliances"("id") ON DELETE set null ON UPDATE no action;