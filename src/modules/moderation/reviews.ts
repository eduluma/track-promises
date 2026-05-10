import type { AccountState } from "@/lib/permissions";
import { appendAuditLog } from "@/modules/audit/logs";
import { updateDemoUserById } from "@/modules/auth/demo-users";

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
  };
};

type ModerationReviewStore = {
  records: ModerationReview[];
};

const moderationReviews: ModerationReview[] = [
  {
    id: "review-1",
    tenantId: "tenant-tamilnadu",
    subjectType: "account",
    subjectId: "limited-user",
    reason: "New user requested early voting access after repeated registration attempts.",
    status: "open",
    decision: null,
    createdAt: "2026-05-29T00:00:00.000Z",
    updatedAt: "2026-05-29T00:00:00.000Z",
    assignedModeratorId: null,
    metadata: {
      userId: "limited-user",
      requestedState: "verified",
      abuseSignals: ["repeated_signup_attempts", "velocity_anomaly"]
    }
  },
  {
    id: "review-2",
    tenantId: "tenant-tamilnadu",
    subjectType: "vote",
    subjectId: "promise-power",
    reason: "Sharp vote change pattern triggered a manual review.",
    status: "in_review",
    decision: null,
    createdAt: "2026-06-02T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z",
    assignedModeratorId: "moderator-user",
    metadata: {
      abuseSignals: ["vote_reversal_spike"]
    }
  }
];

const globalForReviews = globalThis as typeof globalThis & {
  __trackPromisesModerationReviewStore?: ModerationReviewStore;
};

function createInitialStore(): ModerationReviewStore {
  return {
    records: moderationReviews.map((review) => ({ ...review, metadata: { ...review.metadata } }))
  };
}

function getReviewStore() {
  if (!globalForReviews.__trackPromisesModerationReviewStore) {
    globalForReviews.__trackPromisesModerationReviewStore = createInitialStore();
  }

  return globalForReviews.__trackPromisesModerationReviewStore;
}

function applyDecisionToUser(review: ModerationReview, decision: Exclude<ModerationDecision, null>) {
  const userId = review.metadata.userId ?? review.subjectId;
  const user = updateDemoUserById(userId, {
    state: decision === "approve_account" ? "verified" : decision === "limit_account" ? "limited" : undefined,
    trustScore: decision === "approve_account" ? 45 : decision === "limit_account" ? 5 : undefined,
    abuseFlags: decision === "approve_account" ? [] : review.metadata.abuseSignals ?? []
  });

  return user;
}

export { moderationReviews };

export function listModerationReviewsForTenant(tenantId: string, includeResolved = true) {
  return getReviewStore()
    .records.filter((review) => review.tenantId === tenantId)
    .filter((review) => (includeResolved ? true : review.status !== "resolved"))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function getModerationReviewById(reviewId: string) {
  return getReviewStore().records.find((review) => review.id === reviewId) ?? null;
}

export function getOpenModerationReviewsForTenant(tenantId: string) {
  return listModerationReviewsForTenant(tenantId, false);
}

export function resolveModerationReview({
  reviewId,
  moderatorId,
  decision,
  now = new Date().toISOString()
}: {
  reviewId: string;
  moderatorId: string;
  decision: Exclude<ModerationDecision, null>;
  now?: string;
}) {
  const review = getModerationReviewById(reviewId);

  if (!review) {
    return null;
  }

  review.assignedModeratorId = moderatorId;
  review.status = "resolved";
  review.decision = decision;
  review.updatedAt = now;

  const affectedUser = review.subjectType === "account" ? applyDecisionToUser(review, decision) : null;

  appendAuditLog({
    tenantId: review.tenantId,
    actorId: moderatorId,
    action: "moderation.review_resolved",
    entityType: review.subjectType,
    entityId: review.subjectId,
    metadata: {
      reviewId,
      decision,
      affectedUserId: affectedUser?.id ?? null
    },
    createdAt: now
  });

  return review;
}

export type { ModerationReview, ModerationDecision, ModerationReviewStatus };
