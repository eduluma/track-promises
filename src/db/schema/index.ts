import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";

export const accountStateEnum = pgEnum("account_state", [
  "unverified",
  "verified",
  "readonly",
  "suspended",
  "moderator_approved"
]);

export const userRoleEnum = pgEnum("user_role", ["guest", "user", "promise_editor", "moderator", "tenant_admin", "platform_admin"]);

export const promiseStatusEnum = pgEnum("promise_status", [
  "planned",
  "in_progress",
  "fulfilled",
  "delayed",
  "disputed"
]);

export const sourceVerificationStatusEnum = pgEnum("source_verification_status", ["verified", "pending"]);
export const voteValueEnum = pgEnum("vote_value", ["not_started", "started", "in_progress", "mostly_done", "completed"]);
export const votingScopeTypeEnum = pgEnum("voting_scope_type", ["platform", "tenant", "election", "promise"]);
export const moderationSubjectTypeEnum = pgEnum("moderation_subject_type", ["account", "vote", "source", "promise"]);
export const moderationStatusEnum = pgEnum("moderation_status", ["open", "in_review", "resolved", "dismissed"]);

export const tenants = pgTable(
  "tenants",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    jurisdictionType: text("jurisdiction_type").notNull(),
    primaryDomain: text("primary_domain").notNull(),
    tagline: text("tagline").notNull(),
    brandColor: text("brand_color").notNull(),
    defaultLocale: text("default_locale").notNull().default("en"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("tenants_slug_idx").on(table.slug), uniqueIndex("tenants_primary_domain_idx").on(table.primaryDomain)]
);

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    phone: text("phone"),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    state: accountStateEnum("state").notNull().default("unverified"),
    role: userRoleEnum("role").notNull().default("user"),
    trustScore: integer("trust_score").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email), uniqueIndex("users_phone_idx").on(table.phone)]
);

export const tenantConfigs = pgTable(
  "tenant_configs",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    configKey: text("config_key").notNull(),
    configValue: jsonb("config_value").notNull(),
    schemaVersion: integer("schema_version").notNull().default(1),
    updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("tenant_configs_key_idx").on(table.tenantId, table.configKey)]
);

export const timelines = pgTable(
  "timelines",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    year: integer("year").notNull(),
    title: text("title").notNull(),
    electionLabel: text("election_label").notNull(),
    summary: text("summary").notNull(),
    officeTitle: text("office_title").notNull(),
    officeHolder: text("office_holder").notNull(),
    resultsPublishedAt: timestamp("results_published_at", { withTimezone: true }),
    termStartAt: timestamp("term_start_at", { withTimezone: true }),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("timelines_tenant_slug_idx").on(table.tenantId, table.slug),
    index("timelines_tenant_year_idx").on(table.tenantId, table.year)
  ]
);

export const alliances = pgTable(
  "alliances",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    shortName: text("short_name"),
    allianceType: text("alliance_type"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("alliances_tenant_slug_idx").on(table.tenantId, table.slug)]
);

export const timelineAlliances = pgTable(
  "timeline_alliances",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    timelineId: text("timeline_id")
      .notNull()
      .references(() => timelines.id, { onDelete: "cascade" }),
    allianceId: text("alliance_id")
      .notNull()
      .references(() => alliances.id, { onDelete: "cascade" }),
    ballotLabel: text("ballot_label"),
    manifestoUrl: text("manifesto_url"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("timeline_alliances_timeline_alliance_idx").on(table.timelineId, table.allianceId),
    index("timeline_alliances_tenant_timeline_idx").on(table.tenantId, table.timelineId)
  ]
);

export const promises = pgTable(
  "promises",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    timelineId: text("timeline_id").references(() => timelines.id, { onDelete: "set null" }),
    timelineAllianceId: text("timeline_alliance_id").references(() => timelineAlliances.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    jurisdiction: text("jurisdiction").notNull(),
    election: text("election").notNull(),
    personParty: text("person_party").notNull(),
    status: promiseStatusEnum("status").notNull().default("planned"),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("promises_tenant_category_status_idx").on(table.tenantId, table.category, table.status),
    index("promises_tenant_jurisdiction_election_idx").on(table.tenantId, table.jurisdiction, table.election)
  ]
);

export const promiseSources = pgTable(
  "promise_sources",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    promiseId: text("promise_id")
      .notNull()
      .references(() => promises.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    publisher: text("publisher").notNull(),
    excerpt: text("excerpt").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    verificationStatus: sourceVerificationStatusEnum("verification_status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("promise_sources_promise_idx").on(table.promiseId)]
);

export const votingWindows = pgTable(
  "voting_windows",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    scopeType: votingScopeTypeEnum("scope_type").notNull(),
    scopeId: text("scope_id"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    freezeAt: timestamp("freeze_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    rules: jsonb("rules").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("voting_windows_scope_idx").on(table.tenantId, table.scopeType, table.scopeId)]
);

export const votes = pgTable(
  "votes",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    promiseId: text("promise_id")
      .notNull()
      .references(() => promises.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    value: voteValueEnum("value").notNull(),
    voteCategory: text("vote_category").notNull().default("verified"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("votes_promise_user_idx").on(table.promiseId, table.userId), index("votes_promise_updated_idx").on(table.promiseId, table.updatedAt)]
);

export const voteEvents = pgTable(
  "vote_events",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    promiseId: text("promise_id")
      .notNull()
      .references(() => promises.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    previousValue: voteValueEnum("previous_value"),
    newValue: voteValueEnum("new_value").notNull(),
    eventType: text("event_type").notNull(),
    voteCategory: text("vote_category").notNull().default("verified"),
    requestMetadataHash: text("request_metadata_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("vote_events_promise_created_idx").on(table.promiseId, table.createdAt)]
);

export const voteSnapshots = pgTable(
  "vote_snapshots",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    promiseId: text("promise_id")
      .notNull()
      .references(() => promises.id, { onDelete: "cascade" }),
    totalVotes: integer("total_votes").notNull().default(0),
    completionPercent: integer("completion_percent").notNull().default(0),
    snapshotAt: timestamp("snapshot_at", { withTimezone: true }).notNull(),
    generationSource: text("generation_source").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("vote_snapshots_promise_snapshot_idx").on(table.promiseId, table.snapshotAt)]
);

export const promiseStatusHistory = pgTable(
  "promise_status_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    promiseId: text("promise_id")
      .notNull()
      .references(() => promises.id, { onDelete: "cascade" }),
    previousStatus: promiseStatusEnum("previous_status"),
    newStatus: promiseStatusEnum("new_status").notNull(),
    changedBy: text("changed_by").references(() => users.id, { onDelete: "set null" }),
    reason: text("reason").notNull(),
    sourceId: text("source_id").references(() => promiseSources.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("promise_status_history_promise_created_idx").on(table.promiseId, table.createdAt)]
);

export const moderationReviews = pgTable(
  "moderation_reviews",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    subjectType: moderationSubjectTypeEnum("subject_type").notNull(),
    subjectId: text("subject_id").notNull(),
    reason: text("reason").notNull(),
    status: moderationStatusEnum("status").notNull().default("open"),
    assignedModeratorId: text("assigned_moderator_id").references(() => users.id, { onDelete: "set null" }),
    decision: text("decision"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("moderation_reviews_tenant_status_created_idx").on(table.tenantId, table.status, table.createdAt)]
);

export const communityAttestations = pgTable(
  "community_attestations",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    reviewId: text("review_id")
      .notNull()
      .references(() => moderationReviews.id, { onDelete: "cascade" }),
    subjectUserId: text("subject_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    witnessUserId: text("witness_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    relationship: text("relationship").notNull(),
    witnessCity: text("witness_city").notNull(),
    witnessLocality: text("witness_locality"),
    witnessPostalCode: text("witness_postal_code"),
    note: text("note"),
    localityMatched: boolean("locality_matched").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("community_attestations_review_witness_idx").on(table.reviewId, table.witnessUserId),
    index("community_attestations_subject_created_idx").on(table.subjectUserId, table.createdAt),
    index("community_attestations_witness_created_idx").on(table.witnessUserId, table.createdAt)
  ]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("audit_logs_entity_created_idx").on(table.entityType, table.entityId, table.createdAt)]
);

export const scoreEventTypeEnum = pgEnum("score_event_type", [
  "email_verified",
  "account_age",
  "account_state",
  "vote_cast",
  "vote_aligned",
  "flag_acted",
  "witnessed_approval",
  "endorsement_received",
  "endorsement_withdrawn",
  "abuse_flag",
  "review_opened",
  "review_closed",
  "suspension"
]);

export const endorsementStatusEnum = pgEnum("endorsement_status", ["active", "withdrawn"]);

export const userScoreEvents = pgTable(
  "user_score_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    eventType: scoreEventTypeEnum("event_type").notNull(),
    delta: integer("delta").notNull(),
    referenceId: text("reference_id"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("user_score_events_user_tenant_created_idx").on(table.userId, table.tenantId, table.createdAt),
    index("user_score_events_tenant_type_created_idx").on(table.tenantId, table.eventType, table.createdAt)
  ]
);

export const communityEndorsements = pgTable(
  "community_endorsements",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    endorserId: text("endorser_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    note: text("note"),
    status: endorsementStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("community_endorsements_endorser_subject_idx").on(table.endorserId, table.subjectId),
    index("community_endorsements_subject_tenant_idx").on(table.subjectId, table.tenantId)
  ]
);

export const tenantRelations = relations(tenants, ({ many }) => ({
  configs: many(tenantConfigs),
  timelines: many(timelines),
  alliances: many(alliances),
  timelineAlliances: many(timelineAlliances),
  promises: many(promises),
  votingWindows: many(votingWindows),
  moderationReviews: many(moderationReviews),
  communityAttestations: many(communityAttestations),
  auditLogs: many(auditLogs)
}));

export const timelineRelations = relations(timelines, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [timelines.tenantId],
    references: [tenants.id]
  }),
  timelineAlliances: many(timelineAlliances),
  promises: many(promises)
}));

export const allianceRelations = relations(alliances, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [alliances.tenantId],
    references: [tenants.id]
  }),
  timelineAlliances: many(timelineAlliances)
}));

export const timelineAllianceRelations = relations(timelineAlliances, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [timelineAlliances.tenantId],
    references: [tenants.id]
  }),
  timeline: one(timelines, {
    fields: [timelineAlliances.timelineId],
    references: [timelines.id]
  }),
  alliance: one(alliances, {
    fields: [timelineAlliances.allianceId],
    references: [alliances.id]
  }),
  promises: many(promises)
}));

export const promiseRelations = relations(promises, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [promises.tenantId],
    references: [tenants.id]
  }),
  timeline: one(timelines, {
    fields: [promises.timelineId],
    references: [timelines.id]
  }),
  timelineAlliance: one(timelineAlliances, {
    fields: [promises.timelineAllianceId],
    references: [timelineAlliances.id]
  }),
  sources: many(promiseSources),
  votes: many(votes),
  voteEvents: many(voteEvents),
  snapshots: many(voteSnapshots),
  statusHistory: many(promiseStatusHistory)
}));

export const userScoreEventRelations = relations(userScoreEvents, ({ one }) => ({
  user: one(users, {
    fields: [userScoreEvents.userId],
    references: [users.id]
  }),
  tenant: one(tenants, {
    fields: [userScoreEvents.tenantId],
    references: [tenants.id]
  })
}));

export const communityEndorsementRelations = relations(communityEndorsements, ({ one }) => ({
  tenant: one(tenants, {
    fields: [communityEndorsements.tenantId],
    references: [tenants.id]
  }),
  endorser: one(users, {
    fields: [communityEndorsements.endorserId],
    references: [users.id]
  }),
  subject: one(users, {
    fields: [communityEndorsements.subjectId],
    references: [users.id]
  })
}));