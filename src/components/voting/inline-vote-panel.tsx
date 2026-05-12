"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { voteOptions, type VoteValue } from "@/modules/voting/assessment";
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
};

async function readVotePayload(response: Response) {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    return null;
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
}: InlineVotePanelProps) {
    const [summary, setSummary] = useState(initialSummary);
    const [windowState, setWindowState] = useState(initialWindowState);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

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

            const payload = await readVotePayload(response);

            if (!response.ok) {
                setErrorMessage(payload?.error ?? "Voting failed. Please try again.");
                if (payload?.code === "WINDOW_CLOSED") {
                    setWindowState("frozen");
                }
                return;
            }

            if (!payload) {
                setErrorMessage("Voting failed. Please try again.");
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
                <div className="flex gap-2">
                    <div className="flex-1 rounded-2xl border border-moss/25 bg-white/90 px-3 py-2 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-moss">Score</p>
                        <p className="mt-0.5 text-2xl font-bold tabular-nums text-ink">
                            {summary.verifiedVotes > 0 ? `${summary.verifiedCompletionPercent}%` : "—"}
                        </p>
                        <p className="mt-0.5 text-[10px] text-ink/45">{summary.categoryCounts.verified} registered</p>
                    </div>
                    <div className="flex-1 rounded-2xl border border-ink/10 bg-white/60 px-3 py-2 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/50">Guest</p>
                        <p className="mt-0.5 text-2xl font-bold tabular-nums text-ink/70">
                            {summary.guestVotes > 0 ? `${summary.guestCompletionPercent}%` : "—"}
                        </p>
                        <p className="mt-0.5 text-[10px] text-ink/45">{summary.guestVotes} voters</p>
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
