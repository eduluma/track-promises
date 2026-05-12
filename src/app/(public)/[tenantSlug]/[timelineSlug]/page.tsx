import { notFound } from "next/navigation";

import { PromiseCard } from "@/components/promises/promise-card";
import { TimelineHero } from "@/components/timelines/timeline-hero";
import { TableFilter } from "@/components/ui/table-filter";
import { resolveTenantConfig } from "@/config/resolve-config";
import { canUserVote } from "@/lib/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { getOpenModerationReviewsForTenant } from "@/modules/moderation/reviews";
import { getRecentElectionOverviewForTimeline, listPromisesForTenant } from "@/modules/promises/repository";
import { getTenantBySlug } from "@/modules/tenants/data";
import { loadTimelineContent } from "@/modules/timelines/content";
import { getTimelineBySlug } from "@/modules/timelines/data";
import { getTimelineScoreProjection } from "@/modules/timelines/score";

type TimelinePageProps = {
    params: Promise<{ tenantSlug: string; timelineSlug: string }>;
    searchParams: Promise<{ category?: string; status?: string }>;
};

function createFallbackTimelineScore(tenantId: string, timelineSlug: string) {
    const calculatedAt = new Date().toISOString();

    return {
        id: `timeline-score:${tenantId}:${timelineSlug}`,
        tenantId,
        timelineSlug,
        score: 0,
        assessedPromiseProgressPercent: 0,
        assessedPromiseCount: 0,
        promiseCount: 0,
        assessmentCoveragePercent: 0,
        totalVotes: 0,
        termElapsedPercent: 0,
        paceDelta: 0,
        termStartAt: null,
        termEndAt: null,
        termLengthMonths: 0,
        elapsedMonths: 0,
        calculatedAt,
        formulaVersion: 1
    };
}

export default async function TimelinePage({ params, searchParams }: TimelinePageProps) {
    const { tenantSlug, timelineSlug } = await params;
    const { category, status } = await searchParams;
    const tenant = getTenantBySlug(tenantSlug);

    if (!tenant) {
        notFound();
    }

    const timeline = getTimelineBySlug(tenant.id, timelineSlug);

    if (!timeline) {
        notFound();
    }

    const user = await getCurrentUser();
    const config = resolveTenantConfig(tenant.id);
    const promises = await listPromisesForTenant(tenant.id, {
        userId: user?.id ?? null,
        timelineSlug: timeline.slug,
        category: category ?? null,
        status: status && config.statuses.includes(status as (typeof config.statuses)[number]) ? (status as (typeof config.statuses)[number]) : null
    });
    const reviews = await getOpenModerationReviewsForTenant(tenant.id).catch(() => []);
    const recentElectionOverview = getRecentElectionOverviewForTimeline(tenant.id, timeline.slug);
    const timelineScore = await getTimelineScoreProjection({ tenantId: tenant.id, timelineSlug: timeline.slug }).catch(() =>
        createFallbackTimelineScore(tenant.id, timeline.slug)
    );
    const canVote = canUserVote(user);
    const sharedSearchParams = {
        category,
        status
    };
    const overviewContent = await loadTimelineContent(tenant.slug, timeline.slug);

    return (
        <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10">
            <TimelineHero
                tenant={tenant}
                timeline={timeline}
                config={config}
                promiseCount={promises.length}
                reviewCount={reviews.length}
                timelineScore={timelineScore}
                recentElectionOverview={recentElectionOverview}
            />
            {overviewContent ? (
                <section className="mt-8 rounded-[1.75rem] border border-white/80 bg-white/75 p-6 shadow-card">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">Timeline context</p>
                            <h2 className="mt-2 text-2xl font-semibold text-ink">Overview content</h2>
                        </div>
                        <p className="text-sm text-ink/55">Source: {overviewContent.sourcePath.split(`${process.cwd()}/`).pop()}</p>
                    </div>
                    <article
                        className="prose mt-5 max-w-none prose-p:text-ink/75 prose-li:text-ink/75 prose-headings:text-ink"
                        dangerouslySetInnerHTML={{ __html: overviewContent.html }}
                    />
                </section>
            ) : null}
            <section className="mt-8 grid gap-4 lg:grid-cols-2">
                <TableFilter
                    label="Category"
                    queryKey="category"
                    currentValue={category ?? null}
                    options={config.categories}
                    pathname={`/${tenant.slug}/${timeline.slug}`}
                    searchParams={sharedSearchParams}
                />
                <TableFilter
                    label="Status"
                    queryKey="status"
                    currentValue={status ?? null}
                    options={config.statuses}
                    pathname={`/${tenant.slug}/${timeline.slug}`}
                    searchParams={sharedSearchParams}
                />
            </section>
            <section className="mt-10 grid gap-6">
                {promises.map((promise) => (
                    <PromiseCard
                        key={promise.id}
                        tenantSlug={tenant.slug}
                        timelineSlug={timeline.slug}
                        isAuthenticated={Boolean(user)}
                        canVote={canVote}
                        promise={promise}
                    />
                ))}
            </section>
        </main>
    );
}