import type { TenantConfig } from "@/config/schemas";
import type { RecentElectionOverview } from "@/modules/promises/data";
import type { Tenant } from "@/modules/tenants/data";
import type { Timeline } from "@/modules/timelines/data";
import type { TimelineScoreProjection } from "@/modules/timelines/score";

type TimelineHeroProps = {
    tenant: Tenant;
    timeline: Timeline;
    config: TenantConfig;
    promiseCount: number;
    reviewCount: number;
    timelineScore: TimelineScoreProjection;
    recentElectionOverview?: RecentElectionOverview | null;
};

const integerFormatter = new Intl.NumberFormat("en-IN");
const percentFormatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2
});
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
});

function formatDisplayDate(value: string | null) {
    if (!value) {
        return "Awaiting confirmation";
    }

    return dateFormatter.format(new Date(value));
}

export function TimelineHero({ tenant, timeline, config, promiseCount, reviewCount, timelineScore, recentElectionOverview }: TimelineHeroProps) {
    return (
        <section className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/70 p-8 shadow-card backdrop-blur sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay">{tenant.jurisdictionType} Timeline</p>
                    <h1 className="mt-3 font-[var(--font-heading)] text-4xl leading-tight text-ink sm:text-5xl">
                        {tenant.name} / {timeline.slug}
                    </h1>
                    <p className="mt-4 text-base leading-7 text-ink/75">{timeline.summary}</p>
                    <div className="mt-5 flex flex-wrap gap-3 text-sm text-ink/75">
                        <span className="rounded-full bg-sand/80 px-3 py-1">{timeline.officeTitle}: {timeline.officeHolder}</span>
                        <span className="rounded-full bg-sand/80 px-3 py-1">Vote meaning: {config.voteMeaning}</span>
                    </div>
                </div>
                <div className="grid min-w-[17rem] gap-3 text-sm text-ink/75">
                    <div className="rounded-2xl border border-ink/10 bg-moss p-4 text-white">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/72">Timeline score</p>
                        <p className="mt-2 text-4xl font-semibold">{timelineScore.score}</p>
                        <p className="mt-2 text-sm text-white/78">Public delivery estimate across assessed promises.</p>
                    </div>
                    <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-moss">Current timeline</p>
                        <p className="mt-2">{timeline.title}</p>
                        <p className="mt-1 text-xs text-ink/60">Results: {formatDisplayDate(timeline.resultsPublishedAt)}</p>
                        <p className="mt-1 text-xs text-ink/60">Promise clock: {formatDisplayDate(timeline.termStartAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-moss">Open records</p>
                        <p className="mt-2">{promiseCount} promises · {reviewCount} moderation reviews</p>
                    </div>
                </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-ink/10 bg-sand/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-moss">Assessed progress</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{timelineScore.assessedPromiseProgressPercent}%</p>
                    <p className="mt-1 text-sm text-ink/60">Average across promises with votes.</p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-sand/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-moss">Term elapsed</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{timelineScore.termElapsedPercent}%</p>
                    <p className="mt-1 text-sm text-ink/60">
                        {timeline.termStartAt
                            ? `Month ${Math.min(Math.ceil(timelineScore.elapsedMonths), timeline.termLengthMonths)} of ${timeline.termLengthMonths}.`
                            : "Clock starts once the government takes office."}
                    </p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-sand/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-moss">Pace</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{timelineScore.paceDelta >= 0 ? "+" : ""}{timelineScore.paceDelta}</p>
                    <p className="mt-1 text-sm text-ink/60">Points ahead of or behind the term clock.</p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-sand/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-moss">Coverage</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{timelineScore.assessmentCoveragePercent}%</p>
                    <p className="mt-1 text-sm text-ink/60">{timelineScore.assessedPromiseCount} of {timelineScore.promiseCount} promises assessed.</p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-sand/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-moss">Assessments</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{timelineScore.totalVotes}</p>
                    <p className="mt-1 text-sm text-ink/60">Projection refreshed {new Date(timelineScore.calculatedAt).toLocaleString()}.</p>
                </div>
            </div>
            {recentElectionOverview ? (
                <>
                    <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                        <div className="rounded-[1.5rem] border border-ink/10 bg-sand/65 p-5">
                            <div className="flex flex-wrap items-center gap-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">Most recent election snapshot</p>
                                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-ink/70">{recentElectionOverview.year}</span>
                            </div>
                            <h2 className="mt-3 text-xl font-semibold text-ink">{recentElectionOverview.election}</h2>
                            <p className="mt-3 text-sm leading-6 text-ink/75">{recentElectionOverview.summary}</p>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-moss">{recentElectionOverview.winnerTitle}</p>
                                    <p className="mt-2 font-semibold text-ink">{recentElectionOverview.winnerName}</p>
                                    <p className="mt-1 text-sm text-ink/60">{recentElectionOverview.winnerParty}</p>
                                </div>
                                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-moss">Votes cast</p>
                                    <p className="mt-2 font-semibold text-ink">{integerFormatter.format(recentElectionOverview.totalVotesCast)}</p>
                                    <p className="mt-1 text-sm text-ink/60">of {integerFormatter.format(recentElectionOverview.registeredVoters)} registered</p>
                                </div>
                                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-moss">Turnout</p>
                                    <p className="mt-2 font-semibold text-ink">{percentFormatter.format(recentElectionOverview.turnoutPercent)}%</p>
                                    <p className="mt-1 text-sm text-ink/60">statewide participation</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-[1.5rem] border border-ink/10 bg-white/75 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">Primary sources</p>
                            <ul className="mt-4 space-y-3 text-sm text-ink/75">
                                {recentElectionOverview.sources.map((source) => (
                                    <li key={source.url}>
                                        <a className="font-medium text-ink underline decoration-clay/40 underline-offset-4" href={source.url} target="_blank" rel="noreferrer">
                                            {source.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-4 rounded-[1.5rem] border border-ink/10 bg-white/75 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">Result breakdown</p>
                                <h2 className="mt-2 text-xl font-semibold text-ink">Vote share and seats</h2>
                            </div>
                            <p className="text-sm text-ink/55">Recent mandate before {timeline.title}</p>
                        </div>
                        <div className="mt-5 space-y-4">
                            {recentElectionOverview.resultBreakdown.map((result) => (
                                <div key={result.label} className="rounded-2xl border border-ink/10 bg-sand/45 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-ink">{result.label}</p>
                                            <p className="mt-1 text-sm text-ink/60">{result.party ?? result.alliance ?? "Alliance result"}</p>
                                        </div>
                                        <div className="text-right text-sm text-ink/75">
                                            <p>{percentFormatter.format(result.voteSharePercent)}% vote share</p>
                                            <p className="mt-1">{integerFormatter.format(result.votes)} votes{typeof result.seats === "number" ? ` · ${result.seats} seats` : ""}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                        <div
                                            className={result.isWinner ? "h-full rounded-full bg-moss" : "h-full rounded-full bg-clay/70"}
                                            style={{ width: `${Math.min(result.voteSharePercent, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : null}
        </section>
    );
}