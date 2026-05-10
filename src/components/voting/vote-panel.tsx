"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import type { VotingState } from "@/modules/voting/service";

type VotePanelProps = {
  tenantSlug: string;
  timelineSlug: string;
  promiseId: string;
  initialWindowState: VotingState;
  canVote: boolean;
  isAuthenticated: boolean;
  initialSummary: {
    upvotes: number;
    downvotes: number;
    score: number;
    currentVote: "up" | "down" | null;
    eventCount: number;
  };
};

export function VotePanel({ tenantSlug, timelineSlug, promiseId, initialSummary, initialWindowState, canVote, isAuthenticated }: VotePanelProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [windowState, setWindowState] = useState(initialWindowState);
  const [isPending, startTransition] = useTransition();

  const submitVote = (value: "up" | "down") => {
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
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">Voting</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">Current sentiment</h2>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        {isAuthenticated
          ? canVote
            ? "Signed-in accounts can vote while the tenant voting window is open."
            : "This signed-in account is not eligible to vote until verification or moderation is complete."
          : "Sign in with a seeded demo account to cast votes and test account-state enforcement."}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Upvotes</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.upvotes}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Downvotes</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.downvotes}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/55">Score</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.score}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={() => submitVote("up")}
          disabled={buttonsDisabled}
          className="rounded-2xl bg-moss px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-moss/40"
        >
          Upvote {summary.currentVote === "up" ? "(current)" : ""}
        </button>
        <button
          type="button"
          onClick={() => submitVote("down")}
          disabled={buttonsDisabled}
          className="rounded-2xl bg-clay px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-clay/40"
        >
          Downvote {summary.currentVote === "down" ? "(current)" : ""}
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm text-ink/70">
        <p>Window state: {windowState}</p>
        <p className="mt-2">Immutable vote events captured: {summary.eventCount}</p>
      </div>

      {!isAuthenticated ? (
        <Link
          href={`/login?redirectTo=/${tenantSlug}/${timelineSlug}/promises/${promiseId}`}
          className="mt-4 inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-moss/35 hover:text-ink"
        >
          Sign in to vote
        </Link>
      ) : null}

      {errorMessage ? <p className="mt-4 text-sm font-medium text-[#b42318]">{errorMessage}</p> : null}
    </aside>
  );
}
