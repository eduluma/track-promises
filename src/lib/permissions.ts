export type AccountState = "pending" | "verified" | "limited" | "suspended" | "moderator_approved";

export type UserRole = "user" | "editor" | "moderator" | "tenant_admin" | "platform_admin";

export type DemoUser = {
  id: string;
  email?: string | null;
  emailVerified: boolean;
  state: AccountState;
  role?: UserRole;
  tenantIds?: string[];
};

export function canUserVote(user: DemoUser) {
  return user.emailVerified && (user.state === "verified" || user.state === "moderator_approved");
}

export function canManagePromises(user: DemoUser) {
  return user.role === "editor" || user.role === "tenant_admin" || user.role === "platform_admin";
}

export function canReviewModeration(user: DemoUser) {
  return user.role === "moderator" || user.role === "tenant_admin" || user.role === "platform_admin";
}

export function canAccessTenant(user: DemoUser, tenantId: string) {
  return user.role === "platform_admin" || user.tenantIds?.includes(tenantId) === true;
}
