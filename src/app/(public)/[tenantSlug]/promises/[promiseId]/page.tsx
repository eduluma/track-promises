import Link from "next/link";
import { notFound } from "next/navigation";

import { SourceList } from "@/components/sources/source-list";
import { StatusBadge } from "@/components/ui/status-badge";
import { VotePanel } from "@/components/voting/vote-panel";
import { resolveTenantConfig } from "@/config/resolve-config";
import { canUserVote } from "@/lib/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { getPromiseById } from "@/modules/promises/repository";
import { getTenantBySlug } from "@/modules/tenants/data";
import { getPromiseVoteSummary, getVotingWindowStatusForPromise } from "@/modules/voting/service";

type PromiseDetailPageProps = {
  params: Promise<{ tenantSlug: string; promiseId: string }>;
};

export default async function PromiseDetailPage({ params }: PromiseDetailPageProps) {
  const { tenantSlug, promiseId } = await params;
  const tenant = getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const promise = getPromiseById(tenant.id, promiseId);

  if (!promise) {
    notFound();
  }

  const user = await getCurrentUser();
  const config = resolveTenantConfig(tenant.id);
  const summary = getPromiseVoteSummary({ tenantId: tenant.id, promiseId: promise.id, userId: user?.id ?? null });
  const votingWindow = getVotingWindowStatusForPromise({ tenantId: tenant.id, promiseId: promise.id });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-10">
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink/60">
        <Link href={`/${tenant.slug}`} className="transition hover:text-ink">
          {tenant.name}
        </Link>
        <span>/</span>
        <span>{promise.title}</span>
      </div>

      <section className="mt-6 rounded-[2rem] border border-white/80 bg-white/75 p-8 shadow-card backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">
              {promise.category} · {promise.personParty}
            </p>
            <h1 className="mt-3 font-[var(--font-heading)] text-4xl leading-tight text-ink">
              {promise.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-ink/75">{promise.description}</p>
          </div>
          <StatusBadge status={promise.status} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-5">
              <div className="flex flex-wrap gap-3 text-sm text-ink/70">
                <span className="rounded-full bg-white/75 px-3 py-1">Election: {promise.election}</span>
                <span className="rounded-full bg-white/75 px-3 py-1">Jurisdiction: {promise.jurisdiction}</span>
                <span className="rounded-full bg-white/75 px-3 py-1">Vote meaning: {config.voteMeaning}</span>
                <span className="rounded-full bg-white/75 px-3 py-1">Voting: {votingWindow.state}</span>
              </div>
              <div className="mt-5 space-y-3">
                <h2 className="text-lg font-semibold text-ink">Status History</h2>
                <div className="space-y-3">
                  {promise.statusHistory.map((entry) => (
                    <div key={entry.changedAt} className="rounded-2xl border border-ink/10 bg-white/70 p-4">
                      <p className="text-sm font-medium text-ink">
                        {entry.newStatus}
                        <span className="ml-2 text-ink/55">from {entry.previousStatus ?? "not set"}</span>
                      </p>
                      <p className="mt-2 text-sm leading-6 text-ink/70">{entry.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <SourceList sources={promise.sources} />
          </div>

          <VotePanel
            promiseId={promise.id}
            tenantSlug={tenant.slug}
            initialSummary={summary}
            initialWindowState={votingWindow.state}
            isAuthenticated={Boolean(user)}
            canVote={Boolean(user && canUserVote(user))}
          />
        </div>
      </section>
    </main>
  );
}
