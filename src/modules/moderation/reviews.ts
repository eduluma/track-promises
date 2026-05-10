type ModerationReview = {
  id: string;
  tenantId: string;
  subjectType: "account" | "vote" | "source";
  reason: string;
  status: "open" | "resolved";
};

const moderationReviews: ModerationReview[] = [
  {
    id: "review-1",
    tenantId: "tenant-tamilnadu",
    subjectType: "account",
    reason: "New user requested early voting access after repeated registration attempts.",
    status: "open"
  }
];

export { moderationReviews };

export function getOpenModerationReviewsForTenant(tenantId: string) {
  return moderationReviews.filter((review) => review.tenantId === tenantId && review.status === "open");
}

export type { ModerationReview };
