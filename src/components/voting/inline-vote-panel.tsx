"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { VoteSegmentCard } from "@/components/voting/vote-segment-card";
import type { SupportedLocale } from "@/modules/i18n/config";
import type { PublicUiMessages } from "@/modules/i18n/public-ui";
import { localizeAppHref } from "@/modules/i18n/public-content-routes";
import { voteOptions, type VoteValue } from "@/modules/voting/assessment";
import type { VoteSummary, VotingState } from "@/modules/voting/service";

type InlineVotePanelProps = {
    tenantSlug: string;
    timelineSlug: string;
    promiseId: string;
    locale: SupportedLocale;
    messages: PublicUiMessages;
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
    locale,
    messages,
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
                setErrorMessage(payload?.error ?? messages.inlineVotePanel.error);
                if (payload?.code === "WINDOW_CLOSED") {
                    setWindowState("frozen");
                }
                return;
            }

            if (!payload) {
                setErrorMessage(messages.inlineVotePanel.error);
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">{messages.inlineVotePanel.eyebrow}</p>
                    <p className="mt-1 text-sm text-ink/72">{messages.inlineVotePanel.summary}</p>
                </div>
                <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink/60">
                    {messages.windowStateLabels[windowState]}
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
                                {messages.voteShortLabels[option.value]}
                            </button>
                        );
                    })}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:w-[24rem]">
                    <VoteSegmentCard
                        title={messages.voteSegment.registeredUser}
                        completionPercent={summary.registeredCompletionPercent}
                        totalVotes={summary.registeredVotes}
                        counts={summary.registeredCounts}
                        voteLabels={messages.voteLabels}
                        voteSingularLabel={messages.voteSegment.voteSingular}
                        votePluralLabel={messages.voteSegment.votePlural}
                        tone="moss"
                        compact
                    />
                    <VoteSegmentCard
                        title={messages.voteSegment.guestUser}
                        completionPercent={summary.guestCompletionPercent}
                        totalVotes={summary.guestVotes}
                        counts={summary.guestCounts}
                        voteLabels={messages.voteLabels}
                        voteSingularLabel={messages.voteSegment.voteSingular}
                        votePluralLabel={messages.voteSegment.votePlural}
                        compact
                    />
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/65">
                {voteOptions.map((option) => (
                    <span key={option.value} className="rounded-full bg-white/70 px-3 py-1">
                        {messages.voteShortLabels[option.value]} {summary.counts[option.value]}
                    </span>
                ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <Link
                    href={localizeAppHref(`/${tenantSlug}/${timelineSlug}/promises/${promiseId}`, locale)}
                    className="inline-flex items-center justify-center rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-moss/35 hover:text-ink"
                >
                    {messages.inlineVotePanel.learnMore}
                </Link>

                {!isAuthenticated ? (
                    <Link
                        href={localizeAppHref(
                            `/login?redirectTo=${encodeURIComponent(localizeAppHref(redirectPath, locale))}`,
                            locale
                        )}
                        className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-moss/35 hover:text-ink"
                    >
                        {messages.inlineVotePanel.signInToAssess}
                    </Link>
                ) : null}
            </div>

            {errorMessage ? <p className="mt-3 text-sm font-medium text-[#b42318]">{errorMessage}</p> : null}
        </section>
    );
}
