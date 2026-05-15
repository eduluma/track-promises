import { hashSync } from "bcryptjs";
import { and, eq } from "drizzle-orm";

import { runQuery } from "@/db/client";
import { users } from "@/db/schema";
import type { AccountState, UserRole } from "@/lib/permissions";
import { resolveSeedTenantIds } from "@/modules/auth/demo-users";

export type PersistedUserRecord = {
    id: string;
    email: string;
    phone: string | null;
    displayName: string;
    passwordHash: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    state: AccountState;
    role: UserRole;
    trustScore: number;
    createdAt: string;
    updatedAt: string;
    tenantIds: string[];
    abuseFlags: string[];
};

const GUEST_PASSWORD_HASH = hashSync("track-promises-guest-account", 12);

function rowToPersistedUser(row: typeof users.$inferSelect): PersistedUserRecord {
    const tenantIds = resolveSeedTenantIds({
        id: row.id,
        email: row.email
    });

    return {
        id: row.id,
        email: row.email,
        phone: row.phone,
        displayName: row.displayName,
        passwordHash: row.passwordHash,
        emailVerified: row.emailVerified,
        phoneVerified: row.phoneVerified,
        state: row.state,
        role: row.role,
        trustScore: row.trustScore,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        tenantIds,
        abuseFlags: []
    };
}

export async function getPersistedUserById(id: string): Promise<PersistedUserRecord | null> {
    const [row] = await runQuery((db) =>
        db.select().from(users).where(eq(users.id, id)).limit(1)
    );

    return row ? rowToPersistedUser(row) : null;
}

export async function getPersistedUserByEmail(email: string): Promise<PersistedUserRecord | null> {
    const [row] = await runQuery((db) =>
        db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
    );

    return row ? rowToPersistedUser(row) : null;
}

export async function resolvePersistedUserIdentity(identity: {
    id?: string | null;
    email?: string | null;
}): Promise<PersistedUserRecord | null> {
    if (identity.id?.trim()) {
        const byId = await getPersistedUserById(identity.id.trim());

        if (byId) {
            return byId;
        }
    }

    if (identity.email?.trim()) {
        return getPersistedUserByEmail(identity.email.trim().toLowerCase());
    }

    return null;
}

export async function getPersistedUserByPhone(phone: string): Promise<PersistedUserRecord | null> {
    const [row] = await runQuery((db) =>
        db.select().from(users).where(eq(users.phone, phone)).limit(1)
    );

    return row ? rowToPersistedUser(row) : null;
}

export async function createPersistedUser(params: {
    id: string;
    email: string;
    phone?: string | null;
    displayName: string;
    passwordHash: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    state?: AccountState;
    role?: UserRole;
    trustScore?: number;
}): Promise<PersistedUserRecord> {
    const [row] = await runQuery((db) =>
        db
            .insert(users)
            .values({
                id: params.id,
                email: params.email.toLowerCase(),
                phone: params.phone ?? null,
                displayName: params.displayName,
                passwordHash: params.passwordHash,
                emailVerified: params.emailVerified ?? false,
                phoneVerified: params.phoneVerified ?? false,
                state: params.state ?? "unverified",
                role: params.role ?? "user",
                trustScore: params.trustScore ?? 0
            })
            .returning()
    );

    return rowToPersistedUser(row);
}

export async function updatePersistedUserPassword(id: string, passwordHash: string): Promise<boolean> {
    const updatedRows = await runQuery((db) =>
        db
            .update(users)
            .set({ passwordHash, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning({ id: users.id })
    );

    return updatedRows.length > 0;
}

export async function updatePersistedUserPhone(params: {
    id: string;
    phone: string;
    email?: string;
    state?: AccountState;
}): Promise<boolean> {
    const updatedRows = await runQuery((db) =>
        db
            .update(users)
            .set({
                phone: params.phone,
                phoneVerified: false,
                email: params.email?.toLowerCase(),
                state: params.state,
                updatedAt: new Date()
            })
            .where(eq(users.id, params.id))
            .returning({ id: users.id })
    );

    return updatedRows.length > 0;
}

export async function removePersistedUserPhone(params: {
    id: string;
    state?: AccountState;
}): Promise<boolean> {
    const updatedRows = await runQuery((db) =>
        db
            .update(users)
            .set({
                phone: null,
                phoneVerified: false,
                state: params.state,
                updatedAt: new Date()
            })
            .where(eq(users.id, params.id))
            .returning({ id: users.id })
    );

    return updatedRows.length > 0;
}

export async function markPersistedUserEmailVerified(id: string, email?: string): Promise<boolean> {
    const conditions = email ? and(eq(users.id, id), eq(users.email, email.toLowerCase())) : eq(users.id, id);
    const updatedRows = await runQuery((db) =>
        db
            .update(users)
            .set({ emailVerified: true, state: "verified", updatedAt: new Date() })
            .where(conditions)
            .returning({ id: users.id })
    );

    return updatedRows.length > 0;
}

export async function markPersistedUserPhoneVerified(id: string, phone?: string): Promise<boolean> {
    const conditions = phone ? and(eq(users.id, id), eq(users.phone, phone)) : eq(users.id, id);
    const updatedRows = await runQuery((db) =>
        db
            .update(users)
            .set({ phoneVerified: true, state: "verified", updatedAt: new Date() })
            .where(conditions)
            .returning({ id: users.id })
    );

    return updatedRows.length > 0;
}

export async function ensureGuestUser(id: string): Promise<void> {
    await runQuery((db) =>
        db
            .insert(users)
            .values({
                id,
                email: `guest:${id}@guest.local`,
                phone: null,
                displayName: "Guest voter",
                passwordHash: GUEST_PASSWORD_HASH,
                emailVerified: false,
                phoneVerified: false,
                state: "unverified",
                role: "guest",
                trustScore: 0
            })
            .onConflictDoNothing()
    );
}