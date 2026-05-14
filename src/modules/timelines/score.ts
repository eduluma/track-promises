import { promiseRecords } from "@/modules/promises/data";
import { calculateVoteAggregate } from "@/modules/voting/assessment";
import { listVotesForPromise } from "@/modules/voting/store";

import { getTimelineBySlug } from "./data";

export type TimelineScoreProjection = {
    id: string;
    tenantId: string;
    timelineSlug: string;
    score: number;
    assessedPromiseProgressPercent: number;
    assessedPromiseCount: number;
    promiseCount: number;
    assessmentCoveragePercent: number;
    totalVotes: number;
    termElapsedPercent: number;
    paceDelta: number;
    termStartAt: string | null;
    termEndAt: string | null;
    termLengthMonths: number;
    elapsedMonths: number;
    calculatedAt: string;
    formulaVersion: number;
};

const FORMULA_VERSION = 1;

function addMonths(date: Date, months: number) {
    const nextDate = new Date(date);
    nextDate.setUTCMonth(nextDate.getUTCMonth() + months);
    return nextDate;
}

function clampPercentage(value: number) {
    return Math.max(0, Math.min(100, Math.round(value)));
}

function calculateElapsedMonths(startAt: Date, now: Date) {
    if (now <= startAt) {
        return 0;
    }

    const totalMs = now.getTime() - startAt.getTime();
    return Number((totalMs / (1000 * 60 * 60 * 24 * 30.4375)).toFixed(1));
}

function calculateTermMetrics({
    termStartAt,
    termLengthMonths,
    now
}: {
    termStartAt: string | null;
    termLengthMonths: number;
    now: Date;
}) {
    if (!termStartAt) {
        return {
            termEndAt: null,
            termElapsedPercent: 0,
            elapsedMonths: 0
        };
    }

    const startAt = new Date(termStartAt);
    const termEndAt = addMonths(startAt, termLengthMonths);
    const elapsedRatio =
        now <= startAt ? 0 : now >= termEndAt ? 1 : (now.getTime() - startAt.getTime()) / (termEndAt.getTime() - startAt.getTime());

    return {
        termEndAt: termEndAt.toISOString(),
        termElapsedPercent: clampPercentage(elapsedRatio * 100),
        elapsedMonths: calculateElapsedMonths(startAt, now)
    };
}

export async function calculateTimelineScoreProjection({
    tenantId,
    timelineSlug,
    now = new Date()
}: {
    tenantId: string;
    timelineSlug: string;
    now?: Date;
}): Promise<TimelineScoreProjection> {
    const timeline = getTimelineBySlug(tenantId, timelineSlug);

    if (!timeline) {
        throw new Error(`Timeline ${timelineSlug} was not found for ${tenantId}.`);
    }

    const promises = promiseRecords.filter((promise) => promise.tenantId === tenantId && promise.timelineSlug === timelineSlug);
    const aggregateEntries = await Promise.all(
        promises.map(async (promise) => ({
            promiseId: promise.id,
            aggregate: calculateVoteAggregate(await listVotesForPromise(tenantId, promise.id))
        }))
    );
    const assessedAggregates = aggregateEntries.filter((entry) => entry.aggregate.totalVotes > 0);

    const assessedPromiseCount = assessedAggregates.length;
    const promiseCount = promises.length;
    const assessedPromiseProgressPercent =
        assessedPromiseCount === 0
            ? 0
            : Math.round(
                assessedAggregates.reduce((total, entry) => total + entry.aggregate.completionPercent, 0) / assessedPromiseCount
            );
    const assessmentCoveragePercent = promiseCount === 0 ? 0 : Math.round((assessedPromiseCount / promiseCount) * 100);
    const totalVotes = assessedAggregates.reduce((total, entry) => total + entry.aggregate.totalVotes, 0);

    const termMetrics = calculateTermMetrics({
        termStartAt: timeline.termStartAt,
        termLengthMonths: timeline.termLengthMonths,
        now
    });
    const termElapsedPercent = termMetrics.termElapsedPercent;
    const paceDelta = assessedPromiseProgressPercent - termElapsedPercent;

    return {
        id: `timeline-score:${tenantId}:${timelineSlug}`,
        tenantId,
        timelineSlug,
        score: assessedPromiseProgressPercent,
        assessedPromiseProgressPercent,
        assessedPromiseCount,
        promiseCount,
        assessmentCoveragePercent,
        totalVotes,
        termElapsedPercent,
        paceDelta,
        termStartAt: timeline.termStartAt,
        termEndAt: termMetrics.termEndAt,
        termLengthMonths: timeline.termLengthMonths,
        elapsedMonths: termMetrics.elapsedMonths,
        calculatedAt: now.toISOString(),
        formulaVersion: FORMULA_VERSION
    };
}

export async function getTimelineScoreProjection({
    tenantId,
    timelineSlug,
    now = new Date()
}: {
    tenantId: string;
    timelineSlug: string;
    now?: Date;
}): Promise<TimelineScoreProjection> {
    return calculateTimelineScoreProjection({ tenantId, timelineSlug, now });
}

export async function upsertTimelineScoreProjection({
    tenantId,
    timelineSlug,
    now = new Date()
}: {
    tenantId: string;
    timelineSlug: string;
    now?: Date;
}): Promise<TimelineScoreProjection> {
    return calculateTimelineScoreProjection({ tenantId, timelineSlug, now });
}