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

export const demoUsers: DemoUserRecord[] = [
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
        displayName: "Tenant Editor",
        password: "editor-password",
        createdAt: "2025-12-20T00:00:00.000Z",
        emailVerified: true,
        state: "moderator_approved",
        role: "editor",
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
        displayName: "Limited Account",
        password: "limited-password",
        createdAt: "2026-05-28T00:00:00.000Z",
        emailVerified: true,
        state: "limited",
        role: "user",
        trustScore: 10,
        abuseFlags: ["repeated_signup_attempts", "velocity_anomaly"],
        tenantIds: ["tenant-tamilnadu"]
    }
];

export function findDemoUserByEmail(email: string) {
    return demoUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function authenticateDemoUser(email: string, password: string) {
    const user = findDemoUserByEmail(email);

    if (!user || user.password !== password) {
        return null;
    }

    return user;
}

export function getDemoUserById(id: string) {
    return demoUsers.find((user) => user.id === id) ?? null;
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