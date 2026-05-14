import { getIntlLocale, type SupportedLocale } from "@/modules/i18n/config";
import { formatCountLabel, type PublicUiMessages } from "@/modules/i18n/public-ui";
import type { VoteSnapshotRecord } from "@/modules/voting/snapshots";

type VoteTrendChartProps = {
    snapshots: VoteSnapshotRecord[];
    locale: SupportedLocale;
    messages: PublicUiMessages;
};

export function VoteTrendChart({ snapshots, locale, messages }: VoteTrendChartProps) {
    const intlLocale = getIntlLocale(locale);

    if (snapshots.length === 0) {
        return (
            <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-5">
                <h2 className="text-lg font-semibold text-ink">{messages.trend.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ink/70">{messages.trend.emptySummary}</p>
            </section>
        );
    }

    const chartWidth = 320;
    const chartHeight = 140;
    const stepX = snapshots.length === 1 ? 0 : chartWidth / (snapshots.length - 1);

    const points = snapshots
        .map((snapshot, index) => {
            const x = index * stepX;
            const y = chartHeight - (snapshot.completionPercent / 100) * chartHeight;
            return `${x},${Number(y.toFixed(2))}`;
        })
        .join(" ");

    return (
        <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-ink">{messages.trend.title}</h2>
                    <p className="mt-1 text-sm text-ink/65">{messages.trend.summary}</p>
                </div>
                <span className="rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-moss">
                    {formatCountLabel(snapshots.length, messages.trend.snapshotSingular, messages.trend.snapshotPlural)}
                </span>
            </div>
            <div className="mt-5 overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-40 min-w-[20rem] fill-none">
                    <line x1="0" x2={chartWidth} y1={chartHeight} y2={chartHeight} className="stroke-ink/15" strokeWidth="1" />
                    <line x1="0" x2={chartWidth} y1="0" y2="0" className="stroke-ink/10" strokeWidth="1" />
                    <line x1="0" x2={chartWidth} y1={chartHeight / 2} y2={chartHeight / 2} className="stroke-ink/10" strokeWidth="1" />
                    <polyline points={points} className="stroke-clay" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                    {snapshots.map((snapshot, index) => {
                        const x = index * stepX;
                        const y = chartHeight - (snapshot.completionPercent / 100) * chartHeight;
                        return <circle key={snapshot.id} cx={x} cy={y} r="4" className="fill-moss" />;
                    })}
                </svg>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {snapshots.map((snapshot) => (
                    <div key={snapshot.id} className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm text-ink/72">
                        <p className="font-medium text-ink">{new Date(snapshot.snapshotAt).toLocaleDateString(intlLocale)}</p>
                        <p className="mt-2">{messages.trend.completion}: {snapshot.completionPercent}%</p>
                        <p>{messages.trend.assessors}: {snapshot.totalVotes}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}