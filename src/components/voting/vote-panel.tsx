"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { VoteSegmentCard } from "@/components/voting/vote-segment-card";
import type { SupportedLocale } from "@/modules/i18n/config";
import type { PublicUiMessages } from "@/modules/i18n/public-ui";
import { localizeAppHref } from "@/modules/i18n/public-content-routes";
import { voteOptions, type VoteValue } from "@/modules/voting/assessment";
import type { VoteSummary, VotingState } from "@/modules/voting/service";

type VotePanelProps = {
  tenantSlug: string;
  timelineSlug: string;
  promiseId: string;
  locale: SupportedLocale;
  messages: PublicUiMessages;
  initialWindowState: VotingState;
  canVote: boolean;
  isAuthenticated: boolean;
  initialSummary: VoteSummary;
};

async function readVotePayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

export function VotePanel({ tenantSlug, timelineSlug, promiseId, locale, messages, initialSummary, initialWindowState, canVote, isAuthenticated }: VotePanelProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [windowState, setWindowState] = useState(initialWindowState);
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
        setErrorMessage(payload?.error ?? messages.votePanel.error);
        if (payload?.code === "WINDOW_CLOSED") {
          setWindowState("frozen");
        }
        return;
      }

      if (!payload) {
        setErrorMessage(messages.votePanel.error);
        return;
      }

      setSummary(payload.summary);
    });
  };

  const buttonsDisabled = windowState !== "open" || isPending || !canVote;

  return (
    <aside className="rounded-[1.5rem] border border-ink/10 bg-sand/75 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">{messages.votePanel.eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">{messages.votePanel.title}</h2>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        {!canVote
          ? messages.votePanel.cannotVote
          : isAuthenticated
            ? messages.votePanel.authenticatedSummary
            : messages.votePanel.guestSummary}
      </p>

      <div className="mt-5 grid gap-3">
        <VoteSegmentCard
          title={messages.voteSegment.registeredUser}
          completionPercent={summary.registeredCompletionPercent}
          totalVotes={summary.registeredVotes}
          counts={summary.registeredCounts}
          voteLabels={messages.voteLabels}
          voteSingularLabel={messages.voteSegment.voteSingular}
          votePluralLabel={messages.voteSegment.votePlural}
          tone="moss"
        />
        <VoteSegmentCard
          title={messages.voteSegment.guestUser}
          completionPercent={summary.guestCompletionPercent}
          totalVotes={summary.guestVotes}
          counts={summary.guestCounts}
          voteLabels={messages.voteLabels}
          voteSingularLabel={messages.voteSegment.voteSingular}
          votePluralLabel={messages.voteSegment.votePlural}
        />
      </div>

      {/* All-voter crowd estimate */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-ink/8 bg-white/50 px-4 py-3 text-sm">
        <span className="text-ink/60">{messages.votePanel.crowdEstimate}</span>
        <div className="text-right">
          <span className="font-semibold text-ink">{summary.completionPercent}%</span>
          <p className="text-[11px] text-ink/45">{messages.votePanel.leading} {summary.dominantVote ? messages.voteLabels[summary.dominantVote] : messages.none}</p>
        </div>
      </div>

      {/* Stage breakdown */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/65">
        {voteOptions.map((option) => (
          <span key={option.value} className="rounded-full bg-white/70 px-3 py-1">
            {messages.voteShortLabels[option.value]} · {summary.counts[option.value]}
          </span>
        ))}
      </div>

      {/* Vote buttons */}
      <div className="mt-5 flex flex-wrap gap-3">
        {voteOptions.map((option) => {
          const isCurrent = summary.currentVote === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => submitVote(option.value)}
              disabled={buttonsDisabled}
              className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${isCurrent ? "border-moss bg-moss text-white" : "border-ink/10 bg-white/80 text-ink hover:border-moss/35"
                } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {messages.voteLabels[option.value]}
            </button>
          );
        })}
      </div>

      {/* Debug / audit strip */}
      <div className="mt-5 rounded-2xl border border-ink/8 bg-white/50 px-4 py-3 text-xs text-ink/55">
        <div className="flex flex-wrap gap-4">
          <span>{messages.votePanel.window}: <strong>{messages.windowStateLabels[windowState]}</strong></span>
          <span>{messages.votePanel.yourVote}: <strong>{summary.currentVote ? messages.voteLabels[summary.currentVote] : messages.none}</strong></span>
          <span>{messages.votePanel.eventsRecorded}: <strong>{summary.eventCount}</strong></span>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={localizeAppHref(
              `/signup?redirectTo=${encodeURIComponent(localizeAppHref(`/${tenantSlug}/${timelineSlug}/promises/${promiseId}`, locale))}`,
              locale
            )}
            className="inline-flex rounded-full bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-moss/85"
          >
            {messages.votePanel.createAccount}
          </Link>
          <Link
            href={localizeAppHref(
              `/login?redirectTo=${encodeURIComponent(localizeAppHref(`/${tenantSlug}/${timelineSlug}/promises/${promiseId}`, locale))}`,
              locale
            )}
            className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-moss/35 hover:text-ink"
          >
            {messages.votePanel.signIn}
          </Link>
        </div>
      ) : null}

      {errorMessage ? <p className="mt-4 text-sm font-medium text-[#b42318]">{errorMessage}</p> : null}
    </aside>
  );
}
