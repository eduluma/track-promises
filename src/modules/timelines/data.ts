export type Timeline = {
    id: string;
    tenantId: string;
    slug: string;
    title: string;
    summary: string;
    officeTitle: string;
    officeHolder: string;
    default: boolean;
};

const timelineRecords: Timeline[] = [
    {
        id: "timeline-tamilnadu-2026",
        tenantId: "tenant-tamilnadu",
        slug: "2026",
        title: "Tamil Nadu 2026",
        summary: "Track the 2026 state cycle, office context, and every promise record under a stable jurisdiction and timeline URL.",
        officeTitle: "Chief Minister",
        officeHolder: "Demo profile placeholder",
        default: true
    },
    {
        id: "timeline-india-2029",
        tenantId: "tenant-india-2029",
        slug: "2029",
        title: "India 2029",
        summary: "Track the 2029 national cycle with separate public context and promise records under a country and timeline path.",
        officeTitle: "Prime Minister",
        officeHolder: "Demo profile placeholder",
        default: true
    },
    {
        id: "timeline-kerala-2026",
        tenantId: "tenant-kerala",
        slug: "2026",
        title: "Kerala 2026",
        summary: "Track the 2026 Kerala assembly cycle across multiple competing fronts under one state timeline.",
        officeTitle: "Chief Minister",
        officeHolder: "Demo profile placeholder",
        default: true
    }
];

export function listTimelinesForTenant(tenantId: string) {
    return timelineRecords.filter((timeline) => timeline.tenantId === tenantId);
}

export function getTimelineBySlug(tenantId: string, slug: string) {
    return timelineRecords.find((timeline) => timeline.tenantId === tenantId && timeline.slug === slug) ?? null;
}

export function getDefaultTimelineForTenant(tenantId: string) {
    return timelineRecords.find((timeline) => timeline.tenantId === tenantId && timeline.default) ?? null;
}