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

async function readVotePayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

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
    <aside className="rounded-[1.5rem] border border-ink/10 bg-sand/75 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">Public assessment</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">Delivery score</h2>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        {!canVote
          ? "This account cannot vote (suspended or read-only)."
          : isAuthenticated
            ? "Choose the stage that best reflects what has actually been delivered so far."
            : "You\u2019re voting as a guest \u2014 your assessment counts but carries lower weight. Sign in or create an account to have it verified."}
      </p>

      {/* Overall verified score — headline metric */}
      <div className="mt-5 flex items-end gap-4 rounded-2xl bg-white/90 p-5">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">Verified score</p>
          <p className="mt-1 text-5xl font-bold tabular-nums text-ink">
            {summary.verifiedVotes > 0 ? summary.verifiedCompletionPercent : "—"}
            {summary.verifiedVotes > 0 ? <span className="ml-1 text-2xl font-normal text-ink/50">%</span> : null}
          </p>
          <p className="mt-1.5 text-xs text-ink/50">
            {summary.verifiedVotes > 0
              ? `Based on ${summary.verifiedVotes} verified voter${summary.verifiedVotes === 1 ? "" : "s"}`
              : "No verified votes yet"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Leading stage</p>
          <p className="mt-1 text-base font-semibold text-ink">{formatVoteValue(summary.dominantVote)}</p>
        </div>
      </div>

      {/* Vote breakdown by category */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-moss/10 p-3">
          <p className="font-semibold uppercase tracking-[0.14em] text-moss">Verified</p>
          <p className="mt-1 text-2xl font-bold text-ink">{summary.categoryCounts.verified}</p>
          <p className="mt-0.5 text-ink/50">voters</p>
        </div>
        <div className="rounded-xl bg-white/70 p-3">
          <p className="font-semibold uppercase tracking-[0.14em] text-ink/55">Unverified</p>
          <p className="mt-1 text-2xl font-bold text-ink">{summary.categoryCounts.unverified}</p>
          <p className="mt-0.5 text-ink/50">voters</p>
        </div>
        <div className="rounded-xl bg-white/70 p-3">
          <p className="font-semibold uppercase tracking-[0.14em] text-ink/55">Guest</p>
          <p className="mt-1 text-2xl font-bold text-ink">{summary.categoryCounts.guest}</p>
          <p className="mt-0.5 text-ink/50">voters</p>
        </div>
      </div>

      {/* All-voter crowd estimate */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-ink/8 bg-white/50 px-4 py-3 text-sm">
        <span className="text-ink/60">Crowd estimate (all voters)</span>
        <span className="font-semibold text-ink">{summary.completionPercent}%</span>
      </div>

      {/* Stage breakdown */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/65">
        {voteOptions.map((option) => (
          <span key={option.value} className="rounded-full bg-white/70 px-3 py-1">
            {option.shortLabel} · {summary.counts[option.value]}
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
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Debug / audit strip */}
      <div className="mt-5 rounded-2xl border border-ink/8 bg-white/50 px-4 py-3 text-xs text-ink/55">
        <div className="flex flex-wrap gap-4">
          <span>Window: <strong>{windowState}</strong></span>
          <span>Your vote: <strong>{formatVoteValue(summary.currentVote)}</strong></span>
          <span>Events recorded: <strong>{summary.eventCount}</strong></span>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/signup?redirectTo=/${tenantSlug}/${timelineSlug}/promises/${promiseId}`}
            className="inline-flex rounded-full bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-moss/85"
          >
            Create account
          </Link>
          <Link
            href={`/login?redirectTo=/${tenantSlug}/${timelineSlug}/promises/${promiseId}`}
            className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-moss/35 hover:text-ink"
          >
            Sign in
          </Link>
        </div>
      ) : null}

      {errorMessage ? <p className="mt-4 text-sm font-medium text-[#b42318]">{errorMessage}</p> : null}
    </aside>
  );
}
