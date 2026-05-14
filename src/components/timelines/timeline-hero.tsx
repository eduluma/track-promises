import type { TenantConfig } from "@/config/schemas";
import { getIntlLocale, type SupportedLocale } from "@/modules/i18n/config";
import { fillTemplate, type PublicUiMessages } from "@/modules/i18n/public-ui";
import type { RecentElectionOverview } from "@/modules/promises/data";
import type { Tenant } from "@/modules/tenants/data";
import type { Timeline } from "@/modules/timelines/data";
import type { TimelineScoreProjection } from "@/modules/timelines/score";

type TimelineHeroProps = {
    tenant: Tenant;
    timeline: Timeline;
    locale: SupportedLocale;
    messages: PublicUiMessages;
    config: TenantConfig;
    promiseCount: number;
    reviewCount: number;
    timelineScore: TimelineScoreProjection;
    recentElectionOverview?: RecentElectionOverview | null;
};

function formatDisplayDate(value: string | null, locale: SupportedLocale) {
    if (!value) {
        return null;
    }

    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    }).format(new Date(value));
}

export function TimelineHero({ tenant, timeline, locale, messages, config, promiseCount, reviewCount, timelineScore, recentElectionOverview }: TimelineHeroProps) {
    const intlLocale = getIntlLocale(locale);
    const integerFormatter = new Intl.NumberFormat(intlLocale);
    const percentFormatter = new Intl.NumberFormat(intlLocale, {
        maximumFractionDigits: 2
    });
    const resultsDate = formatDisplayDate(timeline.resultsPublishedAt, locale);
    const promiseClockDate = formatDisplayDate(timeline.termStartAt, locale);

    return (
        <section className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/70 p-8 shadow-card backdrop-blur sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay">{tenant.jurisdictionType} {messages.timelineHero.jurisdictionTimeline}</p>
                    <h1 className="mt-3 font-[var(--font-heading)] text-4xl leading-tight text-ink sm:text-5xl">
                        {tenant.name} / {timeline.slug}
                    </h1>
                    <p className="mt-4 text-base leading-7 text-ink/75">{timeline.summary}</p>
                    <div className="mt-5 flex flex-wrap gap-3 text-sm text-ink/75">
                        <span className="rounded-full bg-sand/80 px-3 py-1">{timeline.officeTitle}: {timeline.officeHolder}</span>
                        <span className="rounded-full bg-sand/80 px-3 py-1">{messages.timelineHero.voteMeaning}: {config.voteMeaning}</span>
                    </div>
                </div>
                <div className="grid min-w-[17rem] gap-3 text-sm text-ink/75">
                    <div className="rounded-2xl border border-ink/10 bg-moss p-4 text-white">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/72">{messages.timelineHero.timelineScore}</p>
                        <p className="mt-2 text-4xl font-semibold">{timelineScore.score}</p>
                        <p className="mt-2 text-sm text-white/78">{messages.timelineHero.timelineScoreSummary}</p>
                    </div>
                    <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-moss">{messages.timelineHero.currentTimeline}</p>
                        <p className="mt-2">{timeline.title}</p>
                        <p className="mt-1 text-xs text-ink/60">{messages.timelineHero.results}: {resultsDate ?? messages.none}</p>
                        <p className="mt-1 text-xs text-ink/60">{messages.timelineHero.promiseClock}: {promiseClockDate ?? messages.none}</p>
                    </div>
                    <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-moss">{messages.timelineHero.openRecords}</p>
                        <p className="mt-2">{fillTemplate(messages.timelineHero.openRecordsSummary, { promises: promiseCount, reviews: reviewCount })}</p>
                    </div>
                </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-ink/10 bg-sand/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-moss">{messages.timelineHero.assessedProgress}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{timelineScore.assessedPromiseProgressPercent}%</p>
                    <p className="mt-1 text-sm text-ink/60">{messages.timelineHero.assessedProgressSummary}</p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-sand/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-moss">{messages.timelineHero.termElapsed}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{timelineScore.termElapsedPercent}%</p>
                    <p className="mt-1 text-sm text-ink/60">
                        {timeline.termStartAt
                            ? fillTemplate(messages.timelineHero.monthOf, { elapsed: Math.min(Math.ceil(timelineScore.elapsedMonths), timeline.termLengthMonths), total: timeline.termLengthMonths })
                            : messages.timelineHero.termClockFallback}
                    </p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-sand/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-moss">{messages.timelineHero.pace}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{timelineScore.paceDelta >= 0 ? "+" : ""}{timelineScore.paceDelta}</p>
                    <p className="mt-1 text-sm text-ink/60">{messages.timelineHero.paceSummary}</p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-sand/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-moss">{messages.timelineHero.coverage}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{timelineScore.assessmentCoveragePercent}%</p>
                    <p className="mt-1 text-sm text-ink/60">{fillTemplate(messages.timelineHero.coverageSummary, { assessed: timelineScore.assessedPromiseCount, total: timelineScore.promiseCount })}</p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-sand/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-moss">{messages.timelineHero.assessments}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{timelineScore.totalVotes}</p>
                    <p className="mt-1 text-sm text-ink/60">{fillTemplate(messages.timelineHero.projectionRefreshed, { date: new Date(timelineScore.calculatedAt).toLocaleString(intlLocale) })}</p>
                </div>
            </div>
            {recentElectionOverview ? (
                <>
                    <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                        <div className="rounded-[1.5rem] border border-ink/10 bg-sand/65 p-5">
                            <div className="flex flex-wrap items-center gap-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">{messages.timelineHero.recentElectionSnapshot}</p>
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
                                    <p className="text-xs uppercase tracking-[0.18em] text-moss">{messages.timelineHero.votesCast}</p>
                                    <p className="mt-2 font-semibold text-ink">{integerFormatter.format(recentElectionOverview.totalVotesCast)}</p>
                                    <p className="mt-1 text-sm text-ink/60">{fillTemplate(messages.timelineHero.votesOfRegistered, { registered: integerFormatter.format(recentElectionOverview.registeredVoters) })}</p>
                                </div>
                                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-moss">{messages.timelineHero.turnout}</p>
                                    <p className="mt-2 font-semibold text-ink">{percentFormatter.format(recentElectionOverview.turnoutPercent)}%</p>
                                    <p className="mt-1 text-sm text-ink/60">{messages.timelineHero.statewideParticipation}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-[1.5rem] border border-ink/10 bg-white/75 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">{messages.timelineHero.primarySources}</p>
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
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">{messages.timelineHero.resultBreakdown}</p>
                                <h2 className="mt-2 text-xl font-semibold text-ink">{messages.timelineHero.voteShareAndSeats}</h2>
                            </div>
                            <p className="text-sm text-ink/55">{fillTemplate(messages.timelineHero.recentMandateBefore, { title: timeline.title })}</p>
                        </div>
                        <div className="mt-5 space-y-4">
                            {recentElectionOverview.resultBreakdown.map((result) => (
                                <div key={result.label} className="rounded-2xl border border-ink/10 bg-sand/45 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-ink">{result.label}</p>
                                            <p className="mt-1 text-sm text-ink/60">{result.party ?? result.alliance ?? messages.timelineHero.allianceResult}</p>
                                        </div>
                                        <div className="text-right text-sm text-ink/75">
                                            <p>{fillTemplate(messages.timelineHero.voteShare, { value: percentFormatter.format(result.voteSharePercent) })}</p>
                                            <p className="mt-1">{typeof result.seats === "number" ? fillTemplate(messages.timelineHero.votesAndSeatsWithSeats, { votes: integerFormatter.format(result.votes), seats: result.seats }) : fillTemplate(messages.timelineHero.votesAndSeats, { votes: integerFormatter.format(result.votes) })}</p>
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