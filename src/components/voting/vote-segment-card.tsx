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
    const valueClass = compact ? "text-2xl" : "text-4xl";

    return (
        <div className={`rounded-2xl border ${palette.border} ${palette.background} ${paddingClass}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${palette.label}`}>{title}</p>
            <p className={`mt-1 font-bold tabular-nums text-ink ${valueClass}`}>
                {totalVotes > 0 ? `${completionPercent}%` : "—"}
            </p>
            <p className="mt-1 text-xs text-ink/50">{formatVoteCount(totalVotes)}</p>
            <div className="mt-3 space-y-1.5 text-xs text-ink/68">
                {displayedBreakdownValues.map((value) => {
                    const option = voteOptions.find((candidate) => candidate.value === value)!;

                    return (
                        <div key={value} className="flex items-center justify-between gap-3">
                            <span>{option.label}</span>
                            <span className="tabular-nums text-ink/55">{formatVoteCount(counts[value])}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
