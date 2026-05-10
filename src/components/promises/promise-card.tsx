import { InlineVotePanel } from "@/components/voting/inline-vote-panel";
import type { PromiseRecord } from "@/modules/promises/data";
import { listVoteSnapshotsForPromise } from "@/modules/voting/snapshots";
import { formatVoteValue } from "@/modules/voting/assessment";
import { getVotingWindowStatusForPromise, type VoteSummary } from "@/modules/voting/service";
import { StatusBadge } from "@/components/ui/status-badge";

function formatDeliveryModel(model: NonNullable<PromiseRecord["deliveryPlan"]>["model"]) {
  return model.replaceAll("_", " ");
}

type PromiseCardProps = {
  tenantSlug: string;
  timelineSlug: string;
  isAuthenticated: boolean;
  canVote: boolean;
  promise: PromiseRecord & {
    voteSummary: VoteSummary;
  };
};

export function PromiseCard({ tenantSlug, timelineSlug, isAuthenticated, canVote, promise }: PromiseCardProps) {
  const votingWindow = getVotingWindowStatusForPromise({ tenantId: promise.tenantId, promiseId: promise.id });
  const snapshots = listVoteSnapshotsForPromise(promise.tenantId, promise.id);
  const redirectPath = `/${tenantSlug}/${timelineSlug}#${promise.id}`;

  return (
    <article id={promise.id} className="group rounded-[1.75rem] border border-white/80 bg-white/75 p-6 shadow-card transition hover:-translate-y-1">
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
        <span className="rounded-full border border-ink/10 px-3 py-1">Completion {promise.voteSummary.completionPercent}%</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">Assessors {promise.voteSummary.totalVotes}</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">Leading {formatVoteValue(promise.voteSummary.dominantVote)}</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">Sources {promise.sources.length}</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">Assessment events {promise.voteSummary.eventCount}</span>
        {promise.deliveryPlan ? <span className="rounded-full border border-ink/10 px-3 py-1">Tracking {formatDeliveryModel(promise.deliveryPlan.model)}</span> : null}
        {promise.deliveryPlan?.cadenceLabel ? <span className="rounded-full border border-ink/10 px-3 py-1">Cadence {promise.deliveryPlan.cadenceLabel}</span> : null}
        {promise.deliveryPlan?.targetLabel ? <span className="rounded-full border border-ink/10 px-3 py-1">Target {promise.deliveryPlan.targetLabel}</span> : null}
      </div>

      {promise.deliveryPlan ? (
        <p className="mt-4 text-sm leading-6 text-ink/70">{promise.deliveryPlan.summary}</p>
      ) : null}

      <div className="mt-5">
        <InlineVotePanel
          promiseId={promise.id}
          tenantSlug={tenantSlug}
          timelineSlug={timelineSlug}
          redirectPath={redirectPath}
          isAuthenticated={isAuthenticated}
          canVote={canVote}
          initialWindowState={votingWindow.state}
          initialSummary={promise.voteSummary}
          snapshots={snapshots}
        />
      </div>
    </article>
  );
}
