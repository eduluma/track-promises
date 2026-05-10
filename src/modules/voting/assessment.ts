export const voteValueOrder = ["not_started", "started", "in_progress", "mostly_done", "completed"] as const;

export type VoteValue = (typeof voteValueOrder)[number];

export type VoteOption = {
    value: VoteValue;
    label: string;
    shortLabel: string;
    weight: number;
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
