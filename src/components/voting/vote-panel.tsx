"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { formatVoteValue, voteOptions, type VoteValue } from "@/modules/voting/assessment";
import type { VoteSummary, VotingState } from "@/modules/voting/service";

type VotePanelProps = {
  tenantSlug: string;
  timelineSlug: string;
  promiseId: string;
  initialWindowState: VotingState;
  canVote: boolean;
  isAuthenticated: boolean;
  initialSummary: VoteSummary;
};

export function VotePanel({ tenantSlug, timelineSlug, promiseId, initialSummary, initialWindowState, canVote, isAuthenticated }: VotePanelProps) {
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
    <aside className="rounded-[1.5rem] border border-ink/10 bg-sand/75 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">Public assessment</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">Current delivery stage</h2>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        {isAuthenticated
          ? canVote
            ? "Choose the stage that best reflects what has actually been delivered so far."
            : "This signed-in account is not eligible to vote until verification or moderation is complete."
          : "Sign in with a seeded demo account to submit a delivery-stage assessment."}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Completion</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.completionPercent}%</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Leading stage</p>
          <p className="mt-2 text-lg font-semibold text-ink">{formatVoteValue(summary.dominantVote)}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Assessors</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.totalVotes}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {voteOptions.map((option) => {
          const isCurrent = summary.currentVote === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => submitVote(option.value)}
              disabled={buttonsDisabled}
              className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${isCurrent
                  ? "border-moss bg-moss text-white"
                  : "border-ink/10 bg-white/80 text-ink hover:border-moss/35"
                } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-ink/65">
        {voteOptions.map((option) => (
          <span key={option.value} className="rounded-full bg-white/70 px-3 py-1">
            {option.shortLabel} {summary.counts[option.value]}
          </span>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm text-ink/70">
        <p>Window state: {windowState}</p>
        <p className="mt-2">Your current assessment: {formatVoteValue(summary.currentVote)}</p>
        <p className="mt-2">Immutable assessment events captured: {summary.eventCount}</p>
      </div>

      {!isAuthenticated ? (
        <Link
          href={`/login?redirectTo=/${tenantSlug}/${timelineSlug}/promises/${promiseId}`}
          className="mt-4 inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-moss/35 hover:text-ink"
        >
          Sign in to assess
        </Link>
      ) : null}

      {errorMessage ? <p className="mt-4 text-sm font-medium text-[#b42318]">{errorMessage}</p> : null}
    </aside>
  );
}
