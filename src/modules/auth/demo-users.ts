import type { AccountState, UserRole } from "@/lib/permissions";

export type DemoUserRecord = {
    id: string;
    email: string;
    displayName: string;
    password: string;
    emailVerified: boolean;
    state: AccountState;
    role: UserRole;
    trustScore: number;
    tenantIds: string[];
};

export const demoUsers: DemoUserRecord[] = [
    {
        id: "demo-user",
        email: "demo@track-promises.local",
        displayName: "Verified Voter",
        password: "demo-password",
        emailVerified: true,
        state: "verified",
        role: "user",
        trustScore: 42,
        tenantIds: ["tenant-tamilnadu", "tenant-india-2029"]
    },
    {
        id: "editor-user",
        email: "editor@track-promises.local",
        displayName: "Tenant Editor",
        password: "editor-password",
        emailVerified: true,
        state: "moderator_approved",
        role: "editor",
        trustScore: 68,
        tenantIds: ["tenant-tamilnadu"]
    },
    {
        id: "moderator-user",
        email: "moderator@track-promises.local",
        displayName: "Tenant Moderator",
        password: "moderator-password",
        emailVerified: true,
        state: "moderator_approved",
        role: "moderator",
        trustScore: 81,
        tenantIds: ["tenant-tamilnadu"]
    },
    {
        id: "platform-admin",
        email: "admin@track-promises.local",
        displayName: "Platform Admin",
        password: "admin-password",
        emailVerified: true,
        state: "moderator_approved",
        role: "platform_admin",
        trustScore: 99,
        tenantIds: ["tenant-tamilnadu", "tenant-india-2029"]
    },
    {
        id: "limited-user",
        email: "limited@track-promises.local",
        displayName: "Limited Account",
        password: "limited-password",
        emailVerified: true,
        state: "limited",
        role: "user",
        trustScore: 10,
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