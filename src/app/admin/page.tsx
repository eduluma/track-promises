import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/session";
import { getAdminReportSummary, searchAdminUsers } from "@/modules/admin/reports";
import { getLocalizedHref, getRequestLocalizationContext, getRequestMessages } from "@/modules/i18n/request";

type AdminReportPageProps = {
    searchParams: Promise<{ q?: string }>;
};

export default async function AdminReportPage({ searchParams }: AdminReportPageProps) {
    const user = await getCurrentUser();
    const messages = await getRequestMessages();
    const localization = await getRequestLocalizationContext();
    const adminHref = await getLocalizedHref("/admin");
    const loginHref = await getLocalizedHref(`/login?redirectTo=${encodeURIComponent(adminHref)}`);
    const homeHref = await getLocalizedHref("/");
    const auditHref = await getLocalizedHref("/admin/audit");
    const moderationHref = await getLocalizedHref("/admin/moderation");
    const createPromiseHref = await getLocalizedHref("/admin/promises/new");
    const tenantLocalesHref = await getLocalizedHref("/admin/tenants/localization");

    if (!user) {
        redirect(loginHref);
    }

    if (user.role !== "platform_admin") {
        redirect(homeHref);
    }

    const { q } = await searchParams;
    const searchQuery = q?.trim() ?? "";
    const [summary, searchResults] = await Promise.all([getAdminReportSummary(), searchAdminUsers(searchQuery)]);
    const dateFormatter = new Intl.DateTimeFormat(localization.locale === "ta" ? "ta-IN" : "en-IN", {
        dateStyle: "medium"
    });

    const summaryCards = [
        { label: messages.admin.reportTotalUsers, value: summary.totalUsers },
        { label: messages.admin.reportVerifiedUsers, value: summary.stateCounts.verified },
        { label: messages.admin.reportModeratorApprovedUsers, value: summary.stateCounts.moderator_approved },
        { label: messages.admin.reportRecentUsers, value: summary.recentUsers }
    ];

    return (
        <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10">
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">{messages.admin.eyebrow}</p>
                <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="font-[var(--font-heading)] text-4xl text-ink">{messages.admin.reportTitle}</h1>
                        <p className="mt-4 max-w-3xl text-base leading-7 text-ink/72">{messages.admin.reportSummary}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                        <Link href={createPromiseHref} className="rounded-full border border-ink/10 px-4 py-2 font-medium text-ink/80 transition hover:border-moss/30 hover:text-ink">
                            {messages.navigation.newPromise}
                        </Link>
                        <Link href={tenantLocalesHref} className="rounded-full border border-ink/10 px-4 py-2 font-medium text-ink/80 transition hover:border-moss/30 hover:text-ink">
                            {messages.navigation.tenantLocales}
                        </Link>
                        <Link href={auditHref} className="rounded-full border border-ink/10 px-4 py-2 font-medium text-ink/80 transition hover:border-moss/30 hover:text-ink">
                            {messages.navigation.audit}
                        </Link>
                        <Link href={moderationHref} className="rounded-full border border-ink/10 px-4 py-2 font-medium text-ink/80 transition hover:border-moss/30 hover:text-ink">
                            {messages.navigation.moderation}
                        </Link>
                    </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <article key={card.label} className="rounded-[1.5rem] border border-ink/10 bg-white/90 p-5 shadow-sm">
                            <p className="text-sm font-medium text-ink/60">{card.label}</p>
                            <p className="mt-3 font-[var(--font-heading)] text-4xl text-ink">{card.value.toLocaleString()}</p>
                        </article>
                    ))}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-[1.5rem] border border-ink/10 bg-amber-50/70 p-5 shadow-sm">
                        <p className="text-sm font-medium text-ink/60">{messages.account.stateLabels.unverified}</p>
                        <p className="mt-3 text-3xl font-semibold text-ink">{summary.stateCounts.unverified.toLocaleString()}</p>
                    </article>
                    <article className="rounded-[1.5rem] border border-ink/10 bg-white/90 p-5 shadow-sm">
                        <p className="text-sm font-medium text-ink/60">{messages.account.stateLabels.readonly}</p>
                        <p className="mt-3 text-3xl font-semibold text-ink">{summary.stateCounts.readonly.toLocaleString()}</p>
                    </article>
                    <article className="rounded-[1.5rem] border border-ink/10 bg-white/90 p-5 shadow-sm">
                        <p className="text-sm font-medium text-ink/60">{messages.account.stateLabels.suspended}</p>
                        <p className="mt-3 text-3xl font-semibold text-ink">{summary.stateCounts.suspended.toLocaleString()}</p>
                    </article>
                    <article className="rounded-[1.5rem] border border-ink/10 bg-white/90 p-5 shadow-sm">
                        <p className="text-sm font-medium text-ink/60">{messages.admin.reportOperationalRoles}</p>
                        <p className="mt-3 text-3xl font-semibold text-ink">
                            {(summary.roleCounts.platform_admin + summary.roleCounts.tenant_admin + summary.roleCounts.moderator + summary.roleCounts.promise_editor).toLocaleString()}
                        </p>
                    </article>
                </div>
            </section>

            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur">
                <div className="flex flex-col gap-2">
                    <h2 className="font-[var(--font-heading)] text-3xl text-ink">{messages.admin.reportSearchTitle}</h2>
                    <p className="text-base leading-7 text-ink/72">{messages.admin.reportSearchSummary}</p>
                </div>

                <form action={adminHref} className="mt-6 flex flex-col gap-3 md:flex-row md:items-end">
                    <label className="flex-1 text-sm font-medium text-ink/70" htmlFor="admin-user-search">
                        {messages.admin.reportUserSearchLabel}
                        <input
                            id="admin-user-search"
                            name="q"
                            defaultValue={searchQuery}
                            placeholder={messages.admin.reportUserSearchPlaceholder}
                            className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-moss/40"
                        />
                    </label>
                    <button
                        type="submit"
                        className="inline-flex h-[3.25rem] items-center justify-center rounded-full bg-moss px-5 text-sm font-semibold text-white transition hover:bg-moss/90"
                    >
                        {messages.admin.reportUserSearchSubmit}
                    </button>
                </form>

                <p className="mt-3 text-sm text-ink/60">{messages.admin.reportUserSearchHint}</p>

                {searchQuery ? (
                    <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-ink/10 bg-white/90">
                        <table className="min-w-full divide-y divide-ink/10 text-left text-sm text-ink/80">
                            <thead className="bg-sand/35 text-xs uppercase tracking-[0.18em] text-ink/55">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">{messages.admin.reportUserTableName}</th>
                                    <th className="px-4 py-3 font-semibold">{messages.admin.reportUserTableContact}</th>
                                    <th className="px-4 py-3 font-semibold">{messages.admin.reportUserTableRole}</th>
                                    <th className="px-4 py-3 font-semibold">{messages.admin.reportUserTableState}</th>
                                    <th className="px-4 py-3 font-semibold">{messages.admin.reportUserTableTrust}</th>
                                    <th className="px-4 py-3 font-semibold">{messages.admin.reportUserTableCreated}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/10">
                                {searchResults.length > 0 ? (
                                    searchResults.map((result) => (
                                        <tr key={result.id}>
                                            <td className="px-4 py-4 align-top">
                                                <p className="font-semibold text-ink">{result.displayName}</p>
                                                <p className="mt-1 text-xs text-ink/55">{result.id}</p>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <p>{result.email}</p>
                                                {result.phone ? <p className="mt-1 text-xs text-ink/55">{result.phone}</p> : null}
                                            </td>
                                            <td className="px-4 py-4 align-top">{messages.account.roleLabels[result.role]}</td>
                                            <td className="px-4 py-4 align-top">{messages.account.stateLabels[result.state]}</td>
                                            <td className="px-4 py-4 align-top">{result.trustScore.toLocaleString()}</td>
                                            <td className="px-4 py-4 align-top">{dateFormatter.format(new Date(result.createdAt))}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-5 text-ink/60" colSpan={6}>
                                            {messages.admin.reportUserSearchEmpty}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </section>

            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur">
                <div className="flex flex-col gap-2">
                    <h2 className="font-[var(--font-heading)] text-3xl text-ink">{messages.admin.reportTenantsTitle}</h2>
                    <p className="text-base leading-7 text-ink/72">{messages.admin.reportTenantsSummary}</p>
                </div>

                <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-ink/10 bg-white/90">
                    <table className="min-w-full divide-y divide-ink/10 text-left text-sm text-ink/80">
                        <thead className="bg-sand/35 text-xs uppercase tracking-[0.18em] text-ink/55">
                            <tr>
                                <th className="px-4 py-3 font-semibold">{messages.admin.reportTenantTableTenant}</th>
                                <th className="px-4 py-3 font-semibold">{messages.admin.reportTenantTablePromises}</th>
                                <th className="px-4 py-3 font-semibold">{messages.admin.reportTenantTableVotes}</th>
                                <th className="px-4 py-3 font-semibold">{messages.admin.reportTenantTableVoters}</th>
                                <th className="px-4 py-3 font-semibold">{messages.admin.reportTenantTableOpenReviews}</th>
                                <th className="px-4 py-3 font-semibold">{messages.admin.reportTenantTableResolvedReviews}</th>
                                <th className="px-4 py-3 font-semibold">{messages.admin.reportTenantTableAuditEvents}</th>
                                <th className="px-4 py-3 font-semibold">{messages.admin.reportTenantTableLatestActivity}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                            {summary.tenantSummaries.map((tenant) => (
                                <tr key={tenant.tenantId}>
                                    <td className="px-4 py-4 align-top">
                                        <p className="font-semibold text-ink">{tenant.tenantName}</p>
                                        <p className="mt-1 text-xs text-ink/55">{tenant.tenantSlug}</p>
                                    </td>
                                    <td className="px-4 py-4 align-top">{tenant.promiseCount.toLocaleString()}</td>
                                    <td className="px-4 py-4 align-top">{tenant.voteCount.toLocaleString()}</td>
                                    <td className="px-4 py-4 align-top">{tenant.distinctVoterCount.toLocaleString()}</td>
                                    <td className="px-4 py-4 align-top">{tenant.openModerationCount.toLocaleString()}</td>
                                    <td className="px-4 py-4 align-top">{tenant.resolvedModerationCount.toLocaleString()}</td>
                                    <td className="px-4 py-4 align-top">{tenant.auditLogCount.toLocaleString()}</td>
                                    <td className="px-4 py-4 align-top">
                                        {tenant.latestActivityAt ? dateFormatter.format(new Date(tenant.latestActivityAt)) : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}