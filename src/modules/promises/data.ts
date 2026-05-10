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

export type PromiseRecord = {
  id: string;
  tenantId: string;
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

export const promiseRecords: PromiseRecord[] = [
  {
    id: "promise-power",
    tenantId: "tenant-tamilnadu",
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
