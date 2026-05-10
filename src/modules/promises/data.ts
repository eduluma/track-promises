import { readFileSync } from "node:fs";
import path from "node:path";

import type { PromiseStatus } from "@/config/schemas";

export type PromiseSource = {
  id: string;
  url: string;
  publisher: string;
  excerpt: string;
  capturedAt: string;
  verificationStatus: "verified" | "pending";
};

export type PromiseStatusHistoryEntry = {
  previousStatus: PromiseStatus | null;
  newStatus: PromiseStatus;
  reason: string;
  changedAt: string;
};

export type RecentElectionOverviewSource = {
  label: string;
  url: string;
};

export type RecentElectionOverviewResult = {
  label: string;
  alliance?: string;
  party?: string;
  votes: number;
  voteSharePercent: number;
  seats?: number;
  isWinner?: boolean;
};

export type RecentElectionOverview = {
  election: string;
  year: number;
  summary: string;
  officeTitle: string;
  officeHolder: string;
  officeHolderParty: string;
  totalVotesCast: number;
  turnoutPercent: number;
  registeredVoters: number;
  resultBreakdown: RecentElectionOverviewResult[];
  sources: RecentElectionOverviewSource[];
};

export type PromiseRecord = {
  id: string;
  tenantId: string;
  timelineSlug: string;
  title: string;
  description: string;
  category: string;
  jurisdiction: string;
  election: string;
  personParty: string;
  status: PromiseStatus;
  createdAt: string;
  updatedAt: string;
  sources: PromiseSource[];
  statusHistory: PromiseStatusHistoryEntry[];
};

type PromiseDatasetSource = Pick<PromiseSource, "publisher" | "url" | "excerpt"> &
  Partial<Pick<PromiseSource, "capturedAt" | "verificationStatus">>;

type PromiseDatasetDocument = {
  tenant: {
    slug: string;
    name: string;
    jurisdiction: string;
    country: string;
  };
  timeline: {
    slug: string;
    year: number;
    election: string;
  };
  recentElectionOverview?: RecentElectionOverview;
  alliances: Array<{
    id: string;
    slug: string;
    name: string;
    memberParties: string[];
    promises: Array<{
      id?: string;
      title: string;
      description: string;
      category: string;
      jurisdiction?: string;
      state?: string;
      election: string;
      personParty: string;
      status: PromiseStatus;
      sources?: PromiseDatasetSource[];
    }>;
  }>;
};

const promiseDatasetDirectory = path.join(process.cwd(), "data", "election", "2026");

function getTenantIdFromSlug(slug: string) {
  return slug === "india" ? "tenant-india-2029" : `tenant-${slug}`;
}

function getOverviewKey(tenantId: string, timelineSlug: string) {
  return `${tenantId}::${timelineSlug}`;
}

function readPromiseDataset(fileName: string): PromiseDatasetDocument {
  const filePath = path.join(promiseDatasetDirectory, fileName);

  return JSON.parse(readFileSync(filePath, "utf8")) as PromiseDatasetDocument;
}

function toImportedPromiseRecords(dataset: PromiseDatasetDocument): PromiseRecord[] {
  const createdAt = `${dataset.timeline.year}-01-01T00:00:00.000Z`;

  return dataset.alliances.flatMap((alliance) =>
    alliance.promises.map((promise) => {
      const promiseId = promise.id ?? `${dataset.tenant.slug}-${dataset.timeline.slug}-${alliance.slug}-${promise.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

      return {
        id: promiseId,
        tenantId: getTenantIdFromSlug(dataset.tenant.slug),
        timelineSlug: dataset.timeline.slug,
        title: promise.title,
        description: promise.description,
        category: promise.category,
        jurisdiction: promise.jurisdiction ?? promise.state ?? dataset.tenant.jurisdiction,
        election: promise.election,
        personParty: promise.personParty,
        status: promise.status,
        createdAt,
        updatedAt: createdAt,
        sources: (promise.sources ?? []).map((source, index) => ({
          id: `${promiseId}-source-${index + 1}`,
          url: source.url,
          publisher: source.publisher,
          excerpt: source.excerpt,
          capturedAt: source.capturedAt ?? createdAt,
          verificationStatus: source.verificationStatus ?? "pending"
        })),
        statusHistory: [
          {
            previousStatus: null,
            newStatus: promise.status,
            reason: `Imported from ${dataset.tenant.name} ${dataset.timeline.slug} election dataset.`,
            changedAt: createdAt
          }
        ]
      } satisfies PromiseRecord;
    })
  );
}

const importedPromiseDatasets = [
  readPromiseDataset("kerala-2026-front-promises.json"),
  readPromiseDataset("tamilnadu-2026-tvk-promises.json")
];

const importedPromiseRecords = importedPromiseDatasets.flatMap((dataset) => toImportedPromiseRecords(dataset));

const recentElectionOverviewRecords = new Map(
  importedPromiseDatasets.flatMap((dataset) => {
    const overview = dataset.recentElectionOverview;

    if (!overview) {
      return [];
    }

    return [[getOverviewKey(getTenantIdFromSlug(dataset.tenant.slug), dataset.timeline.slug), overview] as const];
  })
);

export function getRecentElectionOverview(tenantId: string, timelineSlug: string) {
  return recentElectionOverviewRecords.get(getOverviewKey(tenantId, timelineSlug)) ?? null;
}

export const promiseRecords: PromiseRecord[] = [
  ...importedPromiseRecords,
  {
    id: "promise-power",
    tenantId: "tenant-tamilnadu",
    timelineSlug: "demo",
    title: "Deliver uninterrupted power to industrial districts",
    description:
      "Upgrade substations and transmission links across major industrial corridors to cut outage time and improve manufacturing reliability.",
    category: "Energy",
    jurisdiction: "Tamil Nadu",
    election: "State Election 2026",
    personParty: "Alliance for Growth",
    status: "in_progress",
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-04-12T00:00:00.000Z",
    sources: [
      {
        id: "src-power-manifesto",
        url: "https://example.org/manifesto/power",
        publisher: "Alliance for Growth Manifesto",
        excerpt: "We will ensure uninterrupted power for every industrial district within the first eighteen months.",
        capturedAt: "2026-01-03T00:00:00.000Z",
        verificationStatus: "verified"
      },
      {
        id: "src-power-budget",
        url: "https://example.org/budget/power-upgrades",
        publisher: "State Budget Briefing",
        excerpt: "Substation modernization has entered the procurement phase in three industrial corridors.",
        capturedAt: "2026-03-28T00:00:00.000Z",
        verificationStatus: "pending"
      }
    ],
    statusHistory: [
      {
        previousStatus: null,
        newStatus: "planned",
        reason: "Promise imported from campaign manifesto.",
        changedAt: "2026-01-05T00:00:00.000Z"
      },
      {
        previousStatus: "planned",
        newStatus: "in_progress",
        reason: "Procurement and district implementation timelines were published.",
        changedAt: "2026-04-12T00:00:00.000Z"
      }
    ]
  },
  {
    id: "promise-school-meals",
    tenantId: "tenant-tamilnadu",
    timelineSlug: "demo",
    title: "Expand school meal coverage to all government higher secondary students",
    description:
      "Increase school meal program eligibility with district-by-district rollout and published funding milestones.",
    category: "Education",
    jurisdiction: "Tamil Nadu",
    election: "State Election 2026",
    personParty: "Alliance for Growth",
    status: "fulfilled",
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    sources: [
      {
        id: "src-meals-policy",
        url: "https://example.org/policy/school-meals",
        publisher: "Education Department Circular",
        excerpt: "Coverage now includes all higher secondary students in the government school system.",
        capturedAt: "2026-05-01T00:00:00.000Z",
        verificationStatus: "verified"
      }
    ],
    statusHistory: [
      {
        previousStatus: null,
        newStatus: "planned",
        reason: "Promise imported from campaign manifesto.",
        changedAt: "2026-01-05T00:00:00.000Z"
      },
      {
        previousStatus: "planned",
        newStatus: "fulfilled",
        reason: "Department circular and district implementation record confirm completion.",
        changedAt: "2026-05-01T00:00:00.000Z"
      }
    ]
  },
  {
    id: "promise-jobs",
    tenantId: "tenant-india-2029",
    timelineSlug: "2029",
    title: "Create a public dashboard for quarterly job targets",
    description:
      "Publish a national dashboard that tracks quarterly job creation targets against official labour data releases.",
    category: "Jobs",
    jurisdiction: "India",
    election: "General Election 2029",
    personParty: "Forward India",
    status: "planned",
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-02-10T00:00:00.000Z",
    sources: [
      {
        id: "src-jobs-manifesto",
        url: "https://example.org/manifesto/jobs-dashboard",
        publisher: "Forward India Platform",
        excerpt: "A public quarterly jobs dashboard will be launched in the first 100 days.",
        capturedAt: "2026-02-10T00:00:00.000Z",
        verificationStatus: "verified"
      }
    ],
    statusHistory: [
      {
        previousStatus: null,
        newStatus: "planned",
        reason: "Promise entered ahead of election monitoring.",
        changedAt: "2026-02-10T00:00:00.000Z"
      }
    ]
  }
];
