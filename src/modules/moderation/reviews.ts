import { and, eq, ne } from "drizzle-orm";

import { runQuery } from "@/db/client";
import { moderationReviews as moderationReviewsTable, users } from "@/db/schema";
import type { AccountState } from "@/lib/permissions";
import { appendAuditLog } from "@/modules/audit/logs";

type ModerationReviewStatus = "open" | "in_review" | "resolved";
type ModerationDecision = "approve_account" | "limit_account" | "dismiss" | null;

type ModerationReview = {
  id: string;
  tenantId: string;
  subjectType: "account" | "vote" | "source";
  subjectId: string;
  reason: string;
  status: ModerationReviewStatus;
  decision: ModerationDecision;
  createdAt: string;
  updatedAt: string;
  assignedModeratorId: string | null;
  metadata: {
    userId?: string;
    requestedState?: AccountState;
    abuseSignals?: string[];
    communityAttestation?: unknown;
  };
};

function rowToReview(row: typeof moderationReviewsTable.$inferSelect): ModerationReview {
  return {
    id: row.id,
    tenantId: row.tenantId,
    subjectType: row.subjectType as ModerationReview["subjectType"],
    subjectId: row.subjectId,
    reason: row.reason,
    status: row.status as ModerationReviewStatus,
    decision: (row.decision ?? null) as ModerationDecision,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    assignedModeratorId: row.assignedModeratorId,
    metadata: (row.metadata ?? {}) as ModerationReview["metadata"]
  };
}

// Kept for seed backward-compat
export const moderationReviews: ModerationReview[] = [];

export async function listModerationReviewsForTenant(tenantId: string, includeResolved = true): Promise<ModerationReview[]> {
  const rows = await runQuery((db) =>
    db
      .select()
      .from(moderationReviewsTable)
      .where(
        includeResolved
          ? eq(moderationReviewsTable.tenantId, tenantId)
          : and(eq(moderationReviewsTable.tenantId, tenantId), ne(moderationReviewsTable.status, "resolved"))
      )
  );

  return rows
    .map(rowToReview)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getModerationReviewById(reviewId: string): Promise<ModerationReview | null> {
  const [row] = await runQuery((db) =>
    db
      .select()
      .from(moderationReviewsTable)
      .where(eq(moderationReviewsTable.id, reviewId))
      .limit(1)
  );
  return row ? rowToReview(row) : null;
}

export async function getOpenModerationReviewsForTenant(tenantId: string): Promise<ModerationReview[]> {
  return listModerationReviewsForTenant(tenantId, false);
}

export async function createModerationReview({
  id,
  tenantId,
  subjectType,
  subjectId,
  reason,
  metadata,
  status = "open",
  assignedModeratorId = null,
  decision = null,
  now = new Date().toISOString()
}: {
  id: string;
  tenantId: string;
  subjectType: ModerationReview["subjectType"];
  subjectId: string;
  reason: string;
  metadata: ModerationReview["metadata"];
  status?: ModerationReviewStatus;
  assignedModeratorId?: string | null;
  decision?: ModerationDecision;
  now?: string;
}): Promise<ModerationReview> {
  const [row] = await runQuery((db) =>
    db
      .insert(moderationReviewsTable)
      .values({
        id,
        tenantId,
        subjectType,
        subjectId,
        reason,
        status,
        assignedModeratorId,
        decision,
        metadata,
        createdAt: new Date(now),
        updatedAt: new Date(now)
      })
      .returning()
  );

  return rowToReview(row);
}

export async function resolveModerationReview({
  reviewId,
  moderatorId,
  decision,
  now = new Date().toISOString()
}: {
  reviewId: string;
  moderatorId: string;
  decision: Exclude<ModerationDecision, null>;
  now?: string;
}): Promise<ModerationReview | null> {
  const review = await getModerationReviewById(reviewId);
  if (!review) {
    return null;
  }

  await runQuery((db) =>
    db
      .update(moderationReviewsTable)
      .set({
        assignedModeratorId: moderatorId,
        status: "resolved",
        decision,
        updatedAt: new Date(now)
      })
      .where(eq(moderationReviewsTable.id, reviewId))
  );

  // If the review is about an account, update the user's state in DB
  if (review.subjectType === "account") {
    const userId = review.metadata.userId ?? review.subjectId;
    if (decision === "approve_account") {
      await runQuery((db) => db.update(users).set({ state: "verified" }).where(eq(users.id, userId)));
    } else if (decision === "limit_account") {
      await runQuery((db) => db.update(users).set({ state: "readonly" }).where(eq(users.id, userId)));
    }
  }

  await appendAuditLog({
    tenantId: review.tenantId,
    actorId: moderatorId,
    action: "moderation.review_resolved",
    entityType: review.subjectType,
    entityId: review.subjectId,
    metadata: {
      reviewId,
      decision,
      affectedUserId: review.subjectType === "account" ? (review.metadata.userId ?? review.subjectId) : null
    },
    createdAt: now
  });

  return { ...review, status: "resolved", decision, assignedModeratorId: moderatorId, updatedAt: now };
}

export type { ModerationReview, ModerationDecision, ModerationReviewStatus };

