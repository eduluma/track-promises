export const voteValueOrder = ["not_started", "started", "in_progress", "mostly_done", "completed"] as const;

export type VoteValue = (typeof voteValueOrder)[number];

export type VoteOption = {
    value: VoteValue;
    label: string;
    shortLabel: string;
    weight: number;
};

export type VoteAggregate = {
    counts: Record<VoteValue, number>;
    completionPercent: number;
    dominantVote: VoteValue | null;
    totalVotes: number;
};

export const voteOptions: VoteOption[] = [
    {
        value: "not_started",
        label: "Not started",
        shortLabel: "Not started",
        weight: 0
    },
    {
        value: "started",
        label: "Started",
        shortLabel: "Started",
        weight: 20
    },
    {
        value: "in_progress",
        label: "In progress",
        shortLabel: "In progress",
        weight: 55
    },
    {
        value: "mostly_done",
        label: "Mostly done",
        shortLabel: "Mostly done",
        weight: 80
    },
    {
        value: "completed",
        label: "Completed",
        shortLabel: "Completed",
        weight: 100
    }
];

export function getVoteOption(value: VoteValue) {
    return voteOptions.find((option) => option.value === value)!;
}

export function createEmptyVoteCounts(): Record<VoteValue, number> {
    return {
        not_started: 0,
        started: 0,
        in_progress: 0,
        mostly_done: 0,
        completed: 0
    };
}

export function formatVoteValue(value: VoteValue | null | undefined) {
    if (!value) {
        return "None";
    }

    return getVoteOption(value).label;
}

export function calculateVoteAggregate(votes: Array<{ value: VoteValue }>): VoteAggregate {
    const counts = createEmptyVoteCounts();

    for (const vote of votes) {
        counts[vote.value] += 1;
    }

    const totalVotes = votes.length;
    const weightedTotal = votes.reduce((total, vote) => total + getVoteOption(vote.value).weight, 0);
    const completionPercent = totalVotes === 0 ? 0 : Math.round(weightedTotal / totalVotes);
    const dominantVote = voteOptions.reduce<VoteValue | null>((current, option) => {
        if (!current || counts[option.value] > counts[current]) {
            return option.value;
        }

        return current;
    }, null);

    return {
        counts,
        completionPercent,
        dominantVote: totalVotes === 0 ? null : dominantVote,
        totalVotes
    };
}
