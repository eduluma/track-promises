import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getCurrentUser } from "@/modules/auth/session";
import {
    getSyntheticIdentifierType,
    isSyntheticIdentifierEmail,
    isVerifiedAccount,
    maskPhoneNumber
} from "@/modules/auth/identifiers";
import { getIntlLocale } from "@/modules/i18n/config";
import { getLocalizedHref, getRequestLocalizationContext, getRequestMessages } from "@/modules/i18n/request";
import { getCommunityAttestationSummaryForUser } from "@/modules/auth/community-attestations";
import { resolvePersistedUserIdentity } from "@/modules/auth/user-store";
import { computeUserScore, getUserScoreHistoryForUser, getVoteCastPointSummaryForUser } from "@/modules/moderation/community-score";
import { getTenantBySlug, listTenants } from "@/modules/tenants/data";
import { listVotesForUser } from "@/modules/voting/store";
import { promiseRecords } from "@/modules/promises/data";
import {
    AddPhoneForm,
    ChangePasswordForm,
    CommunityAttestationRequestForm,
    VerifyEmailButton,
    VerifyPhoneForm
} from "@/app/account/account-actions";

const STATE_STYLES: Record<string, string> = {
    unverified: "bg-amber-50 text-amber-700 border-amber-200",
    verified: "bg-moss/10 text-moss border-moss/20",
    moderator_approved: "bg-moss/10 text-moss border-moss/20",
    readonly: "bg-ink/5 text-ink/50 border-ink/10",
    suspended: "bg-clay/10 text-clay border-clay/20"
};

type SearchParams = Promise<Record<string, string | undefined>>;

type AccountDisclosureSectionProps = {
    title: string;
    summary?: string;
    children: ReactNode;
    defaultOpen?: boolean;
    tone?: "default" | "warning";
};

function AccountDisclosureSection({
    title,
    summary,
    children,
    defaultOpen = false,
    tone = "default"
}: AccountDisclosureSectionProps) {
    const containerClassName = tone === "warning"
        ? "mt-6 rounded-2xl border border-amber-200 bg-amber-50"
        : "mt-6 rounded-2xl border border-ink/10 bg-white shadow-sm";
    const titleClassName = tone === "warning" ? "font-semibold text-amber-800" : "font-semibold text-ink";
    const summaryClassName = tone === "warning" ? "mt-1 text-sm text-amber-700" : "mt-1 text-sm text-ink/70";
    const dividerClassName = tone === "warning" ? "border-amber-200/80" : "border-ink/10";

    return (
        <details open={defaultOpen} className={containerClassName}>
            <summary className="cursor-pointer px-6 py-5 text-left [&::-webkit-details-marker]:text-ink/45">
                <div className="pr-6">
                    <h2 className={titleClassName}>{title}</h2>
                    {summary ? <p className={summaryClassName}>{summary}</p> : null}
                </div>
            </summary>
            <div className={`border-t px-6 pb-6 pt-5 ${dividerClassName}`}>
                {children}
            </div>
        </details>
    );
}

export default async function AccountPage({ searchParams }: { searchParams: SearchParams }) {
    const user = await getCurrentUser();
    const messages = await getRequestMessages();
    const localization = await getRequestLocalizationContext();

    if (!user) {
        const accountHref = await getLocalizedHref("/account");
        redirect(await getLocalizedHref(`/login?redirectTo=${encodeURIComponent(accountHref)}`));
    }

    const params = await searchParams;
    const verifiedParam = params.verified;
    const phoneParam = params.phone;
    const attestationParam = params.attestation;

    const dbUser = await resolvePersistedUserIdentity({ id: user.id, email: user.email });

    const accountUser = dbUser ?? {
        ...user,
        email: user.email ?? "",
        phone: null,
        displayName: user.name ?? "User",
        trustScore: 0
    };
    const accountUserId = dbUser?.id ?? user.id;
    const activeTenant = (localization.tenantSlug ? getTenantBySlug(localization.tenantSlug) : null)
        ?? (process.env.TRACK_PROMISES_DEFAULT_TENANT ? getTenantBySlug(process.env.TRACK_PROMISES_DEFAULT_TENANT) : null)
        ?? listTenants()[0]
        ?? null;
    const communityScore = activeTenant ? await computeUserScore(accountUserId, activeTenant.id) : null;
    const pointHistory = activeTenant ? await getUserScoreHistoryForUser(accountUserId, activeTenant.id) : null;
    const attestationSummary = activeTenant ? await getCommunityAttestationSummaryForUser(activeTenant.id, accountUserId) : null;
    const attestationHref = attestationSummary ? await getLocalizedHref(`/account/community-attestation/${attestationSummary.reviewId}`) : null;

    const votes = await listVotesForUser(accountUserId);
    const voteTenantIds = Array.from(new Set(votes.map((vote) => vote.tenantId)));
    const votePointSummaries = await Promise.all(
        voteTenantIds.map((tenantId) => getVoteCastPointSummaryForUser(accountUserId, tenantId))
    );
    const votePointsByKey = new Map<string, number>();
    for (const summary of votePointSummaries) {
        for (const promisePoint of summary.promisePoints) {
            votePointsByKey.set(`${promisePoint.tenantId}:${promisePoint.promiseId}`, promisePoint.points);
        }
    }
    const promisesById = new Map(promiseRecords.map((p) => [p.id, p]));

    const stateStyle = STATE_STYLES[accountUser.state] ?? STATE_STYLES.unverified;
    const hasRealEmail = accountUser.email ? !isSyntheticIdentifierEmail(accountUser.email) : false;
    const isVerified = isVerifiedAccount(accountUser);
    const accountMessages = messages.account;
    const contactValue = hasRealEmail ? accountUser.email : accountUser.phone ? maskPhoneNumber(accountUser.phone) : accountUser.email;
    const canDeletePhone = getSyntheticIdentifierType(accountUser.email) !== "phone";
    const displayedTrustScore = communityScore?.totalScore ?? accountUser.trustScore;
    const remainingCommunityScore = communityScore ? Math.max(0, communityScore.promotionThreshold - communityScore.totalScore) : null;
    const pointHistoryDateFormatter = new Intl.DateTimeFormat(getIntlLocale(localization.locale), {
        dateStyle: "medium",
        timeStyle: "short"
    });

    return (
        <main className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
            <h1 className="text-2xl font-semibold text-ink">{accountMessages.title}</h1>

            {/* Flash messages from verification redirect */}
            {verifiedParam === "1" && (
                <div className="mt-4 rounded-xl bg-moss/10 px-4 py-3 text-sm font-medium text-moss">
                    {accountMessages.verifiedFlash}
                </div>
            )}
            {verifiedParam === "invalid" && (
                <div className="mt-4 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
                    {accountMessages.invalidVerificationFlash}
                </div>
            )}
            {verifiedParam === "error" && (
                <div className="mt-4 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
                    {accountMessages.verificationErrorFlash}
                </div>
            )}
            {phoneParam === "1" && (
                <div className="mt-4 rounded-xl bg-moss/10 px-4 py-3 text-sm font-medium text-moss">
                    {accountMessages.phoneSavedFlash}
                </div>
            )}
            {phoneParam === "updated" && (
                <div className="mt-4 rounded-xl bg-moss/10 px-4 py-3 text-sm font-medium text-moss">
                    {accountMessages.phoneUpdatedFlash}
                </div>
            )}
            {phoneParam === "deleted" && (
                <div className="mt-4 rounded-xl bg-moss/10 px-4 py-3 text-sm font-medium text-moss">
                    {accountMessages.phoneDeletedFlash}
                </div>
            )}
            {attestationParam === "requested" && (
                <div className="mt-4 rounded-xl bg-moss/10 px-4 py-3 text-sm font-medium text-moss">
                    {accountMessages.communityAttestationRequestedFlash}
                </div>
            )}

            {/* Profile card */}
            <section className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-lg font-semibold text-ink">{accountUser.displayName ?? user.name}</p>
                        <p className="mt-0.5 text-sm text-ink/60">{contactValue}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border border-moss/20 bg-moss/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                                Score {displayedTrustScore}
                            </span>
                            {communityScore ? (
                                <span
                                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${communityScore.eligible ? "border-moss/25 bg-moss text-white" : "border-amber-200 bg-amber-50 text-amber-700"}`}
                                >
                                    {communityScore.eligible ? "Approved" : `${remainingCommunityScore ?? 0} to approval`}
                                </span>
                            ) : null}
                        </div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${stateStyle}`}>
                        {accountMessages.stateLabels[accountUser.state] ?? accountUser.state}
                    </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <dt className="text-ink/50">{accountMessages.role}</dt>
                        <dd className="font-medium text-ink">{accountMessages.roleLabels[user.role ?? "user"] ?? user.role}</dd>
                    </div>
                    <div>
                        <dt className="text-ink/50">{accountMessages.emailVerified}</dt>
                        <dd className={`font-medium ${accountUser.emailVerified ? "text-moss" : "text-amber-600"}`}>
                            {accountUser.emailVerified ? accountMessages.yes : accountMessages.no}
                        </dd>
                    </div>
                    {accountUser.phone ? (
                        <div>
                            <dt className="text-ink/50">{accountMessages.phoneVerified}</dt>
                            <dd className={`font-medium ${accountUser.phoneVerified ? "text-moss" : "text-amber-600"}`}>
                                {accountUser.phoneVerified ? accountMessages.yes : accountMessages.no}
                            </dd>
                        </div>
                    ) : null}
                    <div className="col-span-2 rounded-2xl border border-moss/20 bg-moss/5 px-4 py-4 sm:px-5">
                        <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-moss/80">
                            {accountMessages.communityScore}
                        </dt>
                        <dd className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-2">
                            <span className="text-3xl font-semibold leading-none text-ink sm:text-4xl">{displayedTrustScore}</span>
                            {communityScore ? (
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${communityScore.eligible ? "bg-moss/15 text-moss" : "bg-ink/5 text-ink/70"}`}>
                                    {communityScore.eligible
                                        ? accountMessages.communityScoreEligible.replace("{threshold}", String(communityScore.promotionThreshold))
                                        : accountMessages.communityScorePending
                                            .replace("{remaining}", String(remainingCommunityScore ?? 0))
                                            .replace("{threshold}", String(communityScore.promotionThreshold))
                                            .replace("{windowDays}", String(communityScore.windowDays))}
                                </span>
                            ) : null}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-ink/50">{accountMessages.votesCast}</dt>
                        <dd className="font-medium text-ink">{votes.length}</dd>
                    </div>
                </dl>
            </section>

            {!isVerified && hasRealEmail && (
                <AccountDisclosureSection
                    title={accountMessages.verifyEmailTitle}
                    summary={accountMessages.verifyEmailSummary}
                    defaultOpen={verifiedParam === "invalid" || verifiedParam === "error" || !accountUser.emailVerified}
                    tone="warning"
                >
                    <VerifyEmailButton messages={accountMessages.verifyEmailButton} />
                </AccountDisclosureSection>
            )}

            {!accountUser.phone ? (
                <AccountDisclosureSection
                    title={accountMessages.addPhoneTitle}
                    summary={accountMessages.addPhoneSummary}
                    defaultOpen={phoneParam === "1" || phoneParam === "deleted" || !accountUser.phone}
                    tone="warning"
                >
                    <AddPhoneForm messages={accountMessages.addPhoneForm} />
                </AccountDisclosureSection>
            ) : (
                <AccountDisclosureSection
                    title={accountMessages.managePhoneTitle}
                    summary={accountMessages.managePhoneSummary}
                    defaultOpen={phoneParam === "updated" || phoneParam === "deleted" || !accountUser.phoneVerified}
                >
                    {!canDeletePhone ? (
                        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            {accountMessages.primaryPhoneDeleteGuard}
                        </p>
                    ) : null}
                    <AddPhoneForm
                        initialPhone={accountUser.phone}
                        canDelete={canDeletePhone}
                        messages={accountMessages.addPhoneForm}
                    />
                </AccountDisclosureSection>
            )}

            {!isVerified && accountUser.phone && !accountUser.phoneVerified && (
                <AccountDisclosureSection
                    title={accountMessages.verifyPhoneTitle}
                    summary={accountMessages.verifyPhoneSummary.replace("{phone}", maskPhoneNumber(accountUser.phone))}
                    defaultOpen
                    tone="warning"
                >
                    <VerifyPhoneForm messages={accountMessages.verifyPhoneForm} />
                </AccountDisclosureSection>
            )}

            {(attestationSummary || accountUser.state === "verified" || !isVerified) && (
                <AccountDisclosureSection
                    title={accountMessages.communityAttestationTitle}
                    summary={accountMessages.communityAttestationSummary}
                    defaultOpen={attestationParam === "requested" || Boolean(attestationSummary)}
                >
                    <p className="mt-2 text-sm text-ink/55">
                        {accountMessages.communityAttestationPromotionSummary}
                    </p>

                    {attestationSummary ? (
                        <div className="mt-4 space-y-4">
                            <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4 text-sm text-ink/72">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="font-medium text-ink">
                                        {attestationSummary.status === "resolved"
                                            ? accountMessages.communityAttestationResolvedStatus
                                            : accountMessages.communityAttestationOpenStatus}
                                    </p>
                                    <span className="rounded-full bg-ink/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-ink/60">
                                        {accountMessages.communityAttestationWitnessCount
                                            .replace("{count}", String(attestationSummary.eligibleWitnessCount))
                                            .replace("{threshold}", String(attestationSummary.witnessThreshold))}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm text-ink/65">
                                    {accountMessages.communityAttestationLocalCount.replace("{count}", String(attestationSummary.localityMatchedWitnessCount))}
                                </p>
                                <p className="mt-3 text-sm text-ink/65">
                                    {accountMessages.communityAttestationRequestLocation.replace("{city}", attestationSummary.request.city)}
                                </p>
                                {attestationSummary.request.locality ? <p className="mt-1 text-sm text-ink/65">{attestationSummary.request.locality}</p> : null}
                                {attestationSummary.request.postalCode ? <p className="mt-1 text-sm text-ink/65">{attestationSummary.request.postalCode}</p> : null}
                                {attestationSummary.request.address ? <p className="mt-1 text-sm text-ink/65">{attestationSummary.request.address}</p> : null}
                                {attestationSummary.request.statement ? <p className="mt-3 italic text-ink/60">&ldquo;{attestationSummary.request.statement}&rdquo;</p> : null}
                                {attestationHref ? (
                                    <p className="mt-4 text-sm text-ink/70">
                                        <span className="font-medium text-ink">{accountMessages.communityAttestationShareLabel}</span>{" "}
                                        <Link href={attestationHref} className="text-moss underline-offset-2 hover:underline">
                                            {attestationHref}
                                        </Link>
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-ink">{accountMessages.communityAttestationWitnessesTitle}</h3>
                                {attestationSummary.witnesses.length === 0 ? (
                                    <p className="mt-2 text-sm text-ink/55">{accountMessages.communityAttestationNoWitnesses}</p>
                                ) : (
                                    <ul className="mt-3 space-y-2">
                                        {attestationSummary.witnesses.map((witness) => (
                                            <li key={witness.id} className="rounded-xl bg-ink/[0.03] px-4 py-3 text-sm text-ink/72">
                                                <p className="font-medium text-ink">{witness.witnessDisplayName}</p>
                                                <p className="mt-1">{witness.relationship}</p>
                                                <p className="mt-1 text-xs text-ink/55">
                                                    {witness.localityMatched ? accountMessages.communityAttestationLocalWitness : accountMessages.communityAttestationRemoteWitness}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <CommunityAttestationRequestForm
                                messages={accountMessages.communityAttestationRequestForm}
                                defaultStatement={accountMessages.communityAttestationRequestForm.statementDefault}
                            />
                        </div>
                    )}
                </AccountDisclosureSection>
            )}

            {/* My votes */}
            <AccountDisclosureSection
                title={accountMessages.myVotes}
                summary={accountMessages.votePointsSummary}
                defaultOpen={votes.length > 0 && votes.length <= 3}
            >
                {votes.length === 0 ? (
                    <p className="text-sm text-ink/50">{accountMessages.noVotes}</p>
                ) : (
                    <ul className="space-y-3">
                        {votes.map((vote) => {
                            const promise = promisesById.get(vote.promiseId);
                            const votePoints = votePointsByKey.get(`${vote.tenantId}:${vote.promiseId}`) ?? 0;
                            return (
                                <li key={`${vote.tenantId}:${vote.promiseId}`} className="flex items-start justify-between gap-4 rounded-xl bg-ink/[0.02] px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-ink">
                                            {promise?.title ?? vote.promiseId}
                                        </p>
                                        <p className="mt-0.5 text-xs text-ink/50">{vote.tenantId}</p>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink/70">
                                            {accountMessages.voteLabels[vote.value] ?? vote.value}
                                        </span>
                                        <span className={`text-xs font-medium ${votePoints > 0 ? "text-moss" : "text-ink/45"}`}>
                                            {votePoints > 0
                                                ? accountMessages.votePointsEarned.replace("{points}", String(votePoints))
                                                : accountMessages.votePointsExpired}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </AccountDisclosureSection>

            {activeTenant && communityScore ? (
                <AccountDisclosureSection
                    title={accountMessages.pointHistoryTitle}
                    summary={accountMessages.pointHistorySummary
                        .replace("{tenant}", activeTenant.name)
                        .replace("{windowDays}", String(communityScore.windowDays))}
                    defaultOpen={Boolean(pointHistory?.entries.length)}
                >
                    <div className="space-y-6">
                        <section>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h3 className="text-sm font-semibold text-ink">{accountMessages.pointHistoryCurrentTitle}</h3>
                                <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/60">
                                    {accountMessages.pointHistoryWindowBadge.replace("{windowDays}", String(communityScore.windowDays))}
                                </span>
                            </div>
                            {communityScore.signals.length === 0 ? (
                                <p className="mt-3 text-sm text-ink/50">{accountMessages.pointHistoryCurrentEmpty}</p>
                            ) : (
                                <ul className="mt-3 space-y-2">
                                    {communityScore.signals.map((signal) => (
                                        <li key={`${signal.eventType}:${signal.description}`} className="flex items-start justify-between gap-4 rounded-xl bg-ink/[0.02] px-4 py-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-ink">{signal.description}</p>
                                            </div>
                                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${signal.delta >= 0 ? "bg-moss/10 text-moss" : "bg-clay/10 text-clay"}`}>
                                                {signal.delta > 0 ? `+${signal.delta}` : String(signal.delta)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section className="border-t border-ink/10 pt-5">
                            <h3 className="text-sm font-semibold text-ink">{accountMessages.pointHistoryActivityTitle}</h3>
                            {pointHistory && pointHistory.entries.length > 0 ? (
                                <ul className="mt-3 space-y-2">
                                    {pointHistory.entries.map((entry) => {
                                        const promiseId = typeof entry.metadata.promiseId === "string" ? entry.metadata.promiseId : null;
                                        const scoredPromise = promiseId ? promisesById.get(promiseId) : null;

                                        return (
                                            <li key={entry.id} className="flex items-start justify-between gap-4 rounded-xl bg-ink/[0.02] px-4 py-3">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-medium text-ink">{entry.description}</p>
                                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${entry.countsTowardCurrentScore ? "bg-moss/10 text-moss" : "bg-ink/5 text-ink/55"}`}>
                                                            {entry.countsTowardCurrentScore
                                                                ? accountMessages.pointHistoryCountsNow
                                                                : accountMessages.pointHistoryExpired}
                                                        </span>
                                                    </div>
                                                    {scoredPromise ? (
                                                        <p className="mt-1 text-xs text-ink/55">{scoredPromise.title}</p>
                                                    ) : null}
                                                    <p className="mt-1 text-xs text-ink/45">
                                                        {pointHistoryDateFormatter.format(new Date(entry.createdAt))}
                                                    </p>
                                                </div>
                                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${entry.delta >= 0 ? "bg-moss/10 text-moss" : "bg-clay/10 text-clay"}`}>
                                                    {entry.delta > 0 ? `+${entry.delta}` : String(entry.delta)}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="mt-3 text-sm text-ink/50">{accountMessages.pointHistoryNoActivity}</p>
                            )}
                        </section>
                    </div>
                </AccountDisclosureSection>
            ) : null}

            {/* Change password */}
            <AccountDisclosureSection title={accountMessages.changePassword}>
                <ChangePasswordForm messages={accountMessages.changePasswordForm} />
            </AccountDisclosureSection>
        </main>
    );
}
