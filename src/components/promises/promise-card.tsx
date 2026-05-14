import { InlineVotePanel } from "@/components/voting/inline-vote-panel";
import type { SupportedLocale } from "@/modules/i18n/config";
import type { PublicUiMessages } from "@/modules/i18n/public-ui";
import type { PromiseRecord } from "@/modules/promises/data";
import { getVotingWindowStatusForPromise, type VoteSummary } from "@/modules/voting/service";
import { StatusBadge } from "@/components/ui/status-badge";

type PromiseCardProps = {
  tenantSlug: string;
  timelineSlug: string;
  locale: SupportedLocale;
  messages: PublicUiMessages;
  isAuthenticated: boolean;
  canVote: boolean;
  promise: PromiseRecord & {
    voteSummary: VoteSummary;
  };
};

export function PromiseCard({ tenantSlug, timelineSlug, locale, messages, isAuthenticated, canVote, promise }: PromiseCardProps) {
  const votingWindow = getVotingWindowStatusForPromise({ tenantId: promise.tenantId, promiseId: promise.id });
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
        <StatusBadge status={promise.status} labels={messages.statusLabels} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink/68">
        <span className="rounded-full border border-ink/10 px-3 py-1">{messages.promiseCard.completion} {promise.voteSummary.completionPercent}%</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">{messages.promiseCard.assessors} {promise.voteSummary.totalVotes}</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">{messages.promiseCard.leading} {promise.voteSummary.dominantVote ? messages.voteLabels[promise.voteSummary.dominantVote] : messages.none}</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">{messages.promiseCard.sources} {promise.sources.length}</span>
        <span className="rounded-full border border-ink/10 px-3 py-1">{messages.promiseCard.assessmentEvents} {promise.voteSummary.eventCount}</span>
        {promise.deliveryPlan ? <span className="rounded-full border border-ink/10 px-3 py-1">{messages.promiseCard.tracking} {messages.deliveryPlan.modelLabels[promise.deliveryPlan.model]}</span> : null}
        {promise.deliveryPlan?.cadenceLabel ? <span className="rounded-full border border-ink/10 px-3 py-1">{messages.promiseCard.cadence} {promise.deliveryPlan.cadenceLabel}</span> : null}
        {promise.deliveryPlan?.targetLabel ? <span className="rounded-full border border-ink/10 px-3 py-1">{messages.promiseCard.target} {promise.deliveryPlan.targetLabel}</span> : null}
      </div>

      {promise.deliveryPlan ? (
        <p className="mt-4 text-sm leading-6 text-ink/70">{promise.deliveryPlan.summary}</p>
      ) : null}

      <div className="mt-5">
        <InlineVotePanel
          promiseId={promise.id}
          tenantSlug={tenantSlug}
          timelineSlug={timelineSlug}
          locale={locale}
          messages={messages}
          redirectPath={redirectPath}
          isAuthenticated={isAuthenticated}
          canVote={canVote}
          initialWindowState={votingWindow.state}
          initialSummary={promise.voteSummary}
        />
      </div>
    </article>
  );
}
