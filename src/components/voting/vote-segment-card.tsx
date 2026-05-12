import { voteOptions, type VoteValue } from "@/modules/voting/assessment";

type VoteSegmentCardProps = {
    title: string;
    completionPercent: number;
    totalVotes: number;
    counts: Record<VoteValue, number>;
    tone?: "moss" | "ink";
    compact?: boolean;
};

const displayedBreakdownValues: VoteValue[] = ["in_progress", "mostly_done", "completed"];

const toneClasses = {
    moss: {
        border: "border-moss/25",
        background: "bg-white/90",
        label: "text-moss"
    },
    ink: {
        border: "border-ink/10",
        background: "bg-white/70",
        label: "text-ink/55"
    }
} as const;

function formatVoteCount(count: number) {
    return `${count} vote${count === 1 ? "" : "s"}`;
}

export function VoteSegmentCard({
    title,
    completionPercent,
    totalVotes,
    counts,
    tone = "ink",
    compact = false
}: VoteSegmentCardProps) {
    const palette = toneClasses[tone];
    const paddingClass = compact ? "p-3" : "p-4";
    const valueClass = compact ? "text-[1.9rem]" : "text-[2.6rem]";
    const rowClass = compact ? "rounded-xl px-2.5 py-2 text-[11px]" : "rounded-xl px-3 py-2.5 text-sm";

    return (
        <div className={`min-w-0 rounded-2xl border ${palette.border} ${palette.background} ${paddingClass}`}>
            <p className={`text-xs font-semibold leading-4 ${palette.label}`}>{title}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
                <p className={`font-bold tabular-nums leading-none text-ink ${valueClass}`}>
                    {totalVotes > 0 ? `${completionPercent}%` : "—"}
                </p>
                <p className="pb-1 text-xs text-ink/50">{formatVoteCount(totalVotes)}</p>
            </div>
            <div className="mt-3 space-y-2 text-ink/72">
                {displayedBreakdownValues.map((value) => {
                    const option = voteOptions.find((candidate) => candidate.value === value)!;

                    return (
                        <div key={value} className={`flex items-center justify-between gap-3 bg-sand/45 ${rowClass}`}>
                            <span className="font-medium text-ink/80">{option.label}</span>
                            <span className="shrink-0 tabular-nums text-ink/55">{formatVoteCount(counts[value])}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
