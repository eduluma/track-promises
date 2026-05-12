import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/session";
import { getDemoUserById } from "@/modules/auth/demo-users";
import { listVotesForUser } from "@/modules/voting/store";
import { promiseRecords } from "@/modules/promises/data";
import { ChangePasswordForm, VerifyEmailButton } from "@/app/account/account-actions";

const VOTE_LABELS: Record<string, string> = {
    not_started: "Not started",
    started: "Started",
    in_progress: "In progress",
    mostly_done: "Mostly done",
    completed: "Completed"
};

const STATE_STYLES: Record<string, string> = {
    unverified: "bg-amber-50 text-amber-700 border-amber-200",
    verified: "bg-moss/10 text-moss border-moss/20",
    moderator_approved: "bg-moss/10 text-moss border-moss/20",
    readonly: "bg-ink/5 text-ink/50 border-ink/10",
    suspended: "bg-clay/10 text-clay border-clay/20"
};

const ROLE_LABELS: Record<string, string> = {
    user: "Voter",
    promise_editor: "Promise Editor",
    moderator: "Moderator",
    tenant_admin: "Tenant Admin",
    platform_admin: "Platform Admin",
    guest: "Guest"
};

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AccountPage({ searchParams }: { searchParams: SearchParams }) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login?callbackUrl=/account");
    }

    const params = await searchParams;
    const verifiedParam = params.verified;

    // Fetch full in-memory record (has emailVerified + state)
    const fullUser = getDemoUserById(user.id);

    const votes = listVotesForUser(user.id);
    const promisesById = new Map(promiseRecords.map((p) => [p.id, p]));

    const stateStyle = STATE_STYLES[fullUser?.state ?? "unverified"] ?? STATE_STYLES.unverified;
    const isVerified = fullUser?.emailVerified && (fullUser.state === "verified" || fullUser.state === "moderator_approved");

    return (
        <main className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
            <h1 className="text-2xl font-semibold text-ink">My account</h1>

            {/* Flash messages from verification redirect */}
            {verifiedParam === "1" && (
                <div className="mt-4 rounded-xl bg-moss/10 px-4 py-3 text-sm font-medium text-moss">
                    Your email is verified. Your votes now count as verified votes.
                </div>
            )}
            {verifiedParam === "invalid" && (
                <div className="mt-4 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
                    That verification link is invalid or has expired. Please request a new one below.
                </div>
            )}

            {/* Profile card */}
            <section className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-lg font-semibold text-ink">{user.name}</p>
                        <p className="mt-0.5 text-sm text-ink/60">{user.email}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${stateStyle}`}>
                        {fullUser?.state ?? "unverified"}
                    </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <dt className="text-ink/50">Role</dt>
                        <dd className="font-medium text-ink">{ROLE_LABELS[user.role ?? "user"] ?? user.role}</dd>
                    </div>
                    <div>
                        <dt className="text-ink/50">Email verified</dt>
                        <dd className={`font-medium ${fullUser?.emailVerified ? "text-moss" : "text-amber-600"}`}>
                            {fullUser?.emailVerified ? "Yes" : "No"}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-ink/50">Trust score</dt>
                        <dd className="font-medium text-ink">{fullUser?.trustScore ?? 0}</dd>
                    </div>
                    <div>
                        <dt className="text-ink/50">Votes cast</dt>
                        <dd className="font-medium text-ink">{votes.length}</dd>
                    </div>
                </dl>
            </section>

            {/* Email verification */}
            {!isVerified && (
                <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                    <h2 className="font-semibold text-amber-800">Verify your email</h2>
                    <p className="mt-1 text-sm text-amber-700">
                        Your votes are currently counted as <strong>unverified</strong>. Verify your email to have them
                        count toward the verified score.
                    </p>
                    <div className="mt-4">
                        <VerifyEmailButton />
                    </div>
                </section>
            )}

            {/* My votes */}
            <section className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-ink">My votes</h2>
                {votes.length === 0 ? (
                    <p className="mt-3 text-sm text-ink/50">You haven&apos;t voted on any promises yet.</p>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {votes.map((vote) => {
                            const promise = promisesById.get(vote.promiseId);
                            return (
                                <li key={`${vote.tenantId}:${vote.promiseId}`} className="flex items-start justify-between gap-4 rounded-xl bg-ink/[0.02] px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-ink">
                                            {promise?.title ?? vote.promiseId}
                                        </p>
                                        <p className="mt-0.5 text-xs text-ink/50">{vote.tenantId}</p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink/70">
                                        {VOTE_LABELS[vote.value] ?? vote.value}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {/* Change password */}
            <section className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-ink">Change password</h2>
                <div className="mt-4">
                    <ChangePasswordForm />
                </div>
            </section>
        </main>
    );
}
