import type { AccountState, UserRole } from "@/lib/permissions";
import { type IdentifierType } from "@/modules/auth/identifiers";

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

type SeedDemoUserDefinition = Omit<DemoUserRecord, "email" | "password"> & {
    defaultEmail: string;
    defaultPassword: string;
};

const seedUserLegacyEnvMap: Partial<Record<SeedDemoUserDefinition["id"], { emailKey: string; passwordKey: string }>> = {
    "demo-user": { emailKey: "RobertUser", passwordKey: "RobertPwd" },
    "editor-user": { emailKey: "AaronUser", passwordKey: "AaronPwd" },
    "moderator-user": { emailKey: "AliceUser", passwordKey: "AlicePwd" },
    "platform-admin": { emailKey: "AnnaUser", passwordKey: "AnnaPwd" },
    "limited-user": { emailKey: "BobUser", passwordKey: "BobPwd" },
    "observer-1": { emailKey: "CarolUser", passwordKey: "CarolPwd" },
    "observer-2": { emailKey: "EstherUser", passwordKey: "EstherPwd" }
};

function getSeedUserEnvKey(id: string, field: "EMAIL" | "PASSWORD") {
    return `TRACK_PROMISES_SEED_${id.toUpperCase().replace(/-/g, "_")}_${field}`;
}

function resolveSeedUserValue(id: string, field: "EMAIL" | "PASSWORD", fallback: string) {
    const explicitValue = process.env[getSeedUserEnvKey(id, field)]?.trim();

    if (explicitValue) {
        return explicitValue;
    }

    const legacyKey = field === "EMAIL"
        ? seedUserLegacyEnvMap[id as keyof typeof seedUserLegacyEnvMap]?.emailKey
        : seedUserLegacyEnvMap[id as keyof typeof seedUserLegacyEnvMap]?.passwordKey;

    const legacyValue = legacyKey ? process.env[legacyKey]?.trim() : undefined;
    return legacyValue || fallback;
}

const seedDemoUserDefinitions: SeedDemoUserDefinition[] = [
    {
        id: "demo-user",
        defaultEmail: "demo@track-promises.local",
        displayName: "Verified Voter",
        defaultPassword: "demo-password",
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
        defaultEmail: "editor@track-promises.local",
        displayName: "Promise Editor",
        defaultPassword: "editor-password",
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
        defaultEmail: "moderator@track-promises.local",
        displayName: "Tenant Moderator",
        defaultPassword: "moderator-password",
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
        defaultEmail: "admin@track-promises.local",
        displayName: "Platform Admin",
        defaultPassword: "admin-password",
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
        defaultEmail: "limited@track-promises.local",
        displayName: "ReadOnly Account",
        defaultPassword: "limited-password",
        createdAt: "2026-05-28T00:00:00.000Z",
        emailVerified: true,
        state: "readonly",
        role: "user",
        trustScore: 10,
        abuseFlags: ["repeated_signup_attempts", "velocity_anomaly"],
        tenantIds: ["tenant-tamilnadu"]
    },
    // Seed-only observer accounts used in sample vote records
    {
        id: "observer-1",
        defaultEmail: "observer1@track-promises.local",
        displayName: "Observer One",
        defaultPassword: "observer-1-password",
        createdAt: "2026-02-01T00:00:00.000Z",
        emailVerified: true,
        state: "verified",
        role: "user",
        trustScore: 30,
        abuseFlags: [],
        tenantIds: ["tenant-tamilnadu"]
    },
    {
        id: "observer-2",
        defaultEmail: "observer2@track-promises.local",
        displayName: "Observer Two",
        defaultPassword: "observer-2-password",
        createdAt: "2026-02-15T00:00:00.000Z",
        emailVerified: true,
        state: "verified",
        role: "user",
        trustScore: 25,
        abuseFlags: [],
        tenantIds: ["tenant-tamilnadu"]
    }
];

const seedDemoUsers: DemoUserRecord[] = seedDemoUserDefinitions.map(({ defaultEmail, defaultPassword, id, ...user }) => ({
    ...user,
    id,
    email: resolveSeedUserValue(id, "EMAIL", defaultEmail),
    password: resolveSeedUserValue(id, "PASSWORD", defaultPassword)
}));

// Keep the exported `demoUsers` name for backwards-compat in seed data and the login page.
export const demoUsers = seedDemoUsers;

export function getDemoUserById(id: string) {
    return demoUsers.find((user) => user.id === id) ?? null;
}

export function getDemoUserByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    return demoUsers.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null;
}

export function resolveSeedTenantIds(identity: { id?: string | null; email?: string | null }) {
    const matchedUser = (identity.id ? getDemoUserById(identity.id) : null)
        ?? (identity.email ? getDemoUserByEmail(identity.email) : null);

    return matchedUser?.tenantIds ?? [];
}

export function deriveDisplayName(type: IdentifierType, value: string, provided?: string): string {
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