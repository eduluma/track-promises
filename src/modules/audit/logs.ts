import { eq } from "drizzle-orm";

import { runQuery } from "@/db/client";
import { auditLogs } from "@/db/schema";

export type AuditLogRecord = {
    id: string;
    tenantId: string | null;
    actorId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata: Record<string, unknown>;
    createdAt: string;
};

function createAuditLogId(action: string, entityId: string, createdAt: string) {
    return `audit:${action}:${entityId}:${createdAt}`;
}

function isGuestActorId(actorId: string | null): boolean {
    return actorId !== null && (actorId === "guest" || actorId.startsWith("guest-"));
}

export async function listAuditLogsForTenant(tenantId: string): Promise<AuditLogRecord[]> {
    const rows = await runQuery((db) =>
        db
            .select()
            .from(auditLogs)
            .where(eq(auditLogs.tenantId, tenantId))
    );

    return rows
        .map((row) => ({
            id: row.id,
            tenantId: row.tenantId,
            actorId: row.actorId,
            action: row.action,
            entityType: row.entityType,
            entityId: row.entityId,
            metadata: (row.metadata ?? {}) as Record<string, unknown>,
            createdAt: row.createdAt.toISOString()
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function appendAuditLog(record: Omit<AuditLogRecord, "id"> & { id?: string }): Promise<AuditLogRecord> {
    const id = record.id ?? createAuditLogId(record.action, record.entityId, record.createdAt);
    // Guest actor IDs cannot be stored due to FK constraint on users.id
    const actorId = isGuestActorId(record.actorId) ? null : record.actorId;

    const finalRecord: AuditLogRecord = { ...record, id, actorId };

    await runQuery((db) =>
        db.insert(auditLogs).values({
            id,
            tenantId: record.tenantId,
            actorId,
            action: record.action,
            entityType: record.entityType,
            entityId: record.entityId,
            metadata: record.metadata,
            createdAt: new Date(record.createdAt)
        }).onConflictDoNothing()
    );

    return finalRecord;
}

export function seedAuditLogRecords(): AuditLogRecord[] {
    return [];
}