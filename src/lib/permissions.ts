export type AccountState = "pending" | "verified" | "limited" | "suspended" | "moderator_approved";

export type DemoUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  state: AccountState;
};

export function canUserVote(user: DemoUser) {
  return user.emailVerified && (user.state === "verified" || user.state === "moderator_approved");
}
