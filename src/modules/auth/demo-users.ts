import type { AccountState, UserRole } from "@/lib/permissions";

export type DemoUserRecord = {
    id: string;
    email: string;
    displayName: string;
    password: string;
    createdAt: string;
    emailVerified: boolean;
    state: AccountState;
    role: UserRole;
    trustScore: number;
    abuseFlags: string[];
    tenantIds: string[];
};

const seedDemoUsers: DemoUserRecord[] = [
    {
        id: "demo-user",
        email: "demo@track-promises.local",
        displayName: "Verified Voter",
        password: "demo-password",
        createdAt: "2026-01-15T00:00:00.000Z",
        emailVerified: true,
        state: "verified",
        role: "user",
        trustScore: 42,
        abuseFlags: [],
        tenantIds: ["tenant-tamilnadu", "tenant-india-2029"]
    },
    {
        id: "editor-user",
        email: "editor@track-promises.local",
        displayName: "Promise Editor",
        password: "editor-password",
        createdAt: "2025-12-20T00:00:00.000Z",
        emailVerified: true,
        state: "moderator_approved",
        role: "promise_editor",
        trustScore: 68,
        abuseFlags: [],
        tenantIds: ["tenant-tamilnadu"]
    },
    {
        id: "moderator-user",
        email: "moderator@track-promises.local",
        displayName: "Tenant Moderator",
        password: "moderator-password",
        createdAt: "2025-11-10T00:00:00.000Z",
        emailVerified: true,
        state: "moderator_approved",
        role: "moderator",
        trustScore: 81,
        abuseFlags: [],
        tenantIds: ["tenant-tamilnadu"]
    },
    {
        id: "platform-admin",
        email: "admin@track-promises.local",
        displayName: "Platform Admin",
        password: "admin-password",
        createdAt: "2025-10-01T00:00:00.000Z",
        emailVerified: true,
        state: "moderator_approved",
        role: "platform_admin",
        trustScore: 99,
        abuseFlags: [],
        tenantIds: ["tenant-tamilnadu", "tenant-india-2029"]
    },
    {
        id: "limited-user",
        email: "limited@track-promises.local",
        displayName: "ReadOnly Account",
        password: "limited-password",
        createdAt: "2026-05-28T00:00:00.000Z",
        emailVerified: true,
        state: "readonly",
        role: "user",
        trustScore: 10,
        abuseFlags: ["repeated_signup_attempts", "velocity_anomaly"],
        tenantIds: ["tenant-tamilnadu"]
    }
];

// Use globalThis so the in-memory store survives Next.js hot-module reloads and
// is shared between the NextAuth handler and API route handlers, which may be
// compiled into different module instances in the same Node process.
const globalForDemoUsers = globalThis as typeof globalThis & {
    __trackPromisesDemoUsers?: DemoUserRecord[];
};

function getDemoUserStore(): DemoUserRecord[] {
    if (!globalForDemoUsers.__trackPromisesDemoUsers) {
        globalForDemoUsers.__trackPromisesDemoUsers = seedDemoUsers.map((u) => ({ ...u }));
    }
    return globalForDemoUsers.__trackPromisesDemoUsers;
}

// Keep the exported `demoUsers` name for backwards-compat (login page reads it for the demo account list).
export const demoUsers = getDemoUserStore();

export function findDemoUserByEmail(email: string) {
    return getDemoUserStore().find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function authenticateDemoUser(email: string, password: string) {
    const user = findDemoUserByEmail(email);

    if (!user || user.password !== password) {
        return null;
    }

    return user;
}

export function getDemoUserById(id: string) {
    return getDemoUserStore().find((user) => user.id === id) ?? null;
}

export type IdentifierType = "email" | "phone" | "aadhaar" | "pan";

export function normalizeIdentifierToEmail(type: IdentifierType, value: string): string {
    switch (type) {
        case "email":
            return value.toLowerCase().trim();
        case "phone":
            return `phone:${value.replace(/\D/g, "")}@signup.local`;
        case "aadhaar":
            return `aadhaar:${value.replace(/\D/g, "")}@signup.local`;
        case "pan":
            return `pan:${value.toUpperCase().replace(/\s/g, "")}@signup.local`;
    }
}

function deriveDisplayName(type: IdentifierType, value: string, provided?: string): string {
    if (provided?.trim()) return provided.trim();
    switch (type) {
        case "email":
            return value.split("@")[0] ?? "User";
        case "phone":
            return `User ${value.replace(/\D/g, "").slice(-4)}`;
        case "aadhaar":
            return `User ${value.replace(/\D/g, "").slice(-4)}`;
        case "pan":
            return `User ${value.toUpperCase().replace(/\s/g, "").slice(-4)}`;
    }
}

export function registerDemoUser(params: {
    identifierType: IdentifierType;
    identifier: string;
    displayName?: string;
}): { user: DemoUserRecord; password: string } | { error: string } {
    const email = normalizeIdentifierToEmail(params.identifierType, params.identifier);

    if (findDemoUserByEmail(email)) {
        return { error: "An account with this identifier already exists." };
    }

    const password = crypto.randomUUID();
    const id = `user-${crypto.randomUUID().slice(0, 8)}`;

    const newUser: DemoUserRecord = {
        id,
        email,
        displayName: deriveDisplayName(params.identifierType, params.identifier, params.displayName),
        password,
        createdAt: new Date().toISOString(),
        emailVerified: false,
        state: "unverified",
        role: "user",
        trustScore: 0,
        abuseFlags: [],
        tenantIds: []
    };

    getDemoUserStore().push(newUser);
    return { user: newUser, password };
}

export function updateDemoUserById(
    id: string,
    patch: Partial<Pick<DemoUserRecord, "state" | "trustScore" | "abuseFlags">>
) {
    const user = getDemoUserById(id);

    if (!user) {
        return null;
    }

    if (patch.state) {
        user.state = patch.state;
    }

    if (typeof patch.trustScore === "number") {
        user.trustScore = patch.trustScore;
    }

    if (patch.abuseFlags) {
        user.abuseFlags = patch.abuseFlags;
    }

    return user;
}