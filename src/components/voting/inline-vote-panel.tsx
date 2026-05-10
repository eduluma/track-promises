"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { formatVoteValue, voteOptions, type VoteValue } from "@/modules/voting/assessment";
import type { VoteSnapshotRecord } from "@/modules/voting/snapshots";
import type { VoteSummary, VotingState } from "@/modules/voting/service";

type InlineVotePanelProps = {
    tenantSlug: string;
    timelineSlug: string;
    promiseId: string;
    redirectPath: string;
    isAuthenticated: boolean;
    canVote: boolean;
    initialWindowState: VotingState;
    initialSummary: VoteSummary;
    snapshots: VoteSnapshotRecord[];
};

function getChartPointY(completionPercent: number, chartHeight: number) {
    return chartHeight - (completionPercent / 100) * chartHeight;
}

export function InlineVotePanel({
    tenantSlug,
    timelineSlug,
    promiseId,
    redirectPath,
    isAuthenticated,
    canVote,
    initialWindowState,
    initialSummary,
    snapshots
}: InlineVotePanelProps) {
    const [summary, setSummary] = useState(initialSummary);
    const [windowState, setWindowState] = useState(initialWindowState);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const trendPoints = [
        ...snapshots.map((snapshot) => ({
            id: snapshot.id,
            label: new Date(snapshot.snapshotAt).toLocaleDateString(),
            completionPercent: snapshot.completionPercent,
            isLive: false
        })),
        {
            id: `${promiseId}:live`,
            label: "Live",
            completionPercent: summary.completionPercent,
            isLive: true
        }
    ];

    const chartWidth = 164;
    const chartHeight = 36;
    const stepX = trendPoints.length === 1 ? 0 : chartWidth / (trendPoints.length - 1);
    const polylinePoints = trendPoints
        .map((point, index) => {
            const x = index * stepX;
            const y = getChartPointY(point.completionPercent, chartHeight);
            return `${x},${Number(y.toFixed(2))}`;
        })
        .join(" ");

    const submitVote = (value: VoteValue) => {
        startTransition(async () => {
            setErrorMessage(null);
            const response = await fetch("/api/votes", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ tenantSlug, promiseId, value })
            });

            const payload = await response.json();

            if (!response.ok) {
                setErrorMessage(payload.error ?? "Voting failed.");
                if (payload.code === "WINDOW_CLOSED") {
                    setWindowState("frozen");
                }
                return;
            }

            setSummary(payload.summary);
        });
    };

    const buttonsDisabled = windowState !== "open" || isPending || !canVote;

    return (
        <section className="rounded-[1.25rem] border border-ink/10 bg-sand/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">Quick assessment</p>
                    <p className="mt-1 text-sm text-ink/72">Pick the stage that best describes delivery right now.</p>
                </div>
                <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink/60">
                    {windowState}
                </span>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="flex flex-wrap gap-2">
                    {voteOptions.map((option) => {
                        const isCurrent = summary.currentVote === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => submitVote(option.value)}
                                disabled={buttonsDisabled}
                                className={`rounded-full border px-3 py-2 text-xs font-medium transition ${isCurrent
                                        ? "border-moss bg-moss text-white"
                                        : "border-ink/10 bg-white/80 text-ink hover:border-moss/35"
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {option.shortLabel}
                            </button>
                        );
                    })}
                </div>
                <div className="rounded-2xl border border-ink/10 bg-white/80 px-3 py-2 text-xs text-ink/70">
                    <div className="flex items-center justify-between gap-3">
                        <span>{summary.completionPercent}% crowd estimate</span>
                        <span>{summary.totalVotes} assessors</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-10 w-44 fill-none">
                            <line x1="0" x2={chartWidth} y1={chartHeight} y2={chartHeight} className="stroke-ink/15" strokeWidth="1" />
                            <line x1="0" x2={chartWidth} y1="0" y2="0" className="stroke-ink/10" strokeWidth="1" />
                            <line x1="0" x2={chartWidth} y1={chartHeight / 2} y2={chartHeight / 2} className="stroke-ink/10" strokeWidth="1" />
                            <polyline points={polylinePoints} className="stroke-clay" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            {trendPoints.map((point, index) => {
                                const x = index * stepX;
                                const y = getChartPointY(point.completionPercent, chartHeight);

                                return (
                                    <circle
                                        key={point.id}
                                        cx={x}
                                        cy={y}
                                        r={point.isLive ? "4" : "3"}
                                        className={point.isLive ? "fill-moss" : "fill-ink/45"}
                                    />
                                );
                            })}
                        </svg>
                        <div>
                            <p>Leading: {formatVoteValue(summary.dominantVote)}</p>
                            <p className="mt-1">Events: {summary.eventCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/65">
                {voteOptions.map((option) => (
                    <span key={option.value} className="rounded-full bg-white/70 px-3 py-1">
                        {option.shortLabel} {summary.counts[option.value]}
                    </span>
                ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <Link
                    href={`/${tenantSlug}/${timelineSlug}/promises/${promiseId}`}
                    className="inline-flex items-center justify-center rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-moss/35 hover:text-ink"
                >
                    Learn more
                </Link>

                {!isAuthenticated ? (
                    <Link
                        href={`/login?redirectTo=${encodeURIComponent(redirectPath)}`}
                        className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-moss/35 hover:text-ink"
                    >
                        Sign in to assess
                    </Link>
                ) : null}
            </div>

            {errorMessage ? <p className="mt-3 text-sm font-medium text-[#b42318]">{errorMessage}</p> : null}
        </section>
    );
}
