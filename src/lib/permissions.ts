import { isVerifiedAccount } from "@/modules/auth/identifiers";

export type AccountState = "unverified" | "verified" | "readonly" | "suspended" | "moderator_approved";

export type UserRole = "guest" | "user" | "promise_editor" | "moderator" | "tenant_admin" | "platform_admin";

export type VoteCategory = "verified" | "unverified" | "guest";

export type DemoUser = {
  id: string;
  email?: string | null;
  emailVerified: boolean;
  phoneVerified?: boolean;
  state: AccountState;
  role?: UserRole;
  tenantIds?: string[];
};

/**
 * Returns the trust category of a vote cast by this user (or null for guest).
 * - "verified"   : email confirmed + account state cleared
 * - "unverified" : registered but not yet verified
 * - "guest"      : no account / guest session
 */
export function getVoteCategory(user: DemoUser | null): VoteCategory {
  if (!user || user.role === "guest") return "guest";
  if (isVerifiedAccount(user)) return "verified";
  return "unverified";
}

/**
 * Whether the user is allowed to cast a vote at all.
 * Suspended and readonly accounts are blocked; everyone else (including
 * unverified registrations and guests) may vote — their category is tracked.
 */
export function canUserVote(user: DemoUser | null): boolean {
  if (!user || user.role === "guest") return true;
  return user.state !== "suspended" && user.state !== "readonly";
}

export function canManagePromises(user: DemoUser) {
  return user.role === "promise_editor" || user.role === "tenant_admin" || user.role === "platform_admin";
}

export function canReviewModeration(user: DemoUser) {
  return user.role === "moderator" || user.role === "tenant_admin" || user.role === "platform_admin";
}

export function canAccessTenant(user: DemoUser, tenantId: string) {
  return user.role === "platform_admin" || user.tenantIds?.includes(tenantId) === true;
}
