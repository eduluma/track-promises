import Link from "next/link";

import type { PromiseRecord } from "@/modules/promises/data";
import { StatusBadge } from "@/components/ui/status-badge";

type PromiseCardProps = {
  tenantSlug: string;
  promise: PromiseRecord & {
    voteSummary: {
      upvotes: number;
      downvotes: number;
      score: number;
      currentVote: "up" | "down" | null;
      eventCount: number;
    };
  };
};

export function PromiseCard({ tenantSlug, promise }: PromiseCardProps) {
  return (
    <Link
      href={`/${tenantSlug}/promises/${promise.id}`}
      className="group rounded-[1.75rem] border border-white/80 bg-white/75 p-6 shadow-card transition hover:-translate-y-1"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">
            {promise.category} · {promise.election}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-ink group-hover:text-clay">{promise.title}</h2>
          <p className="mt-3 text-sm leading-6 text-ink/72">{promise.description}</p>
        </div>
        <StatusBadge status={promise.status} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink/68">
        <span className="rounded-full border border-ink/10 px-3 py-1">Upvotes {promise.voteSummary.upvotes}</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">Downvotes {promise.voteSummary.downvotes}</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">Score {promise.voteSummary.score}</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">Sources {promise.sources.length}</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">Vote events {promise.voteSummary.eventCount}</span>
      </div>
    </Link>
  );
}
