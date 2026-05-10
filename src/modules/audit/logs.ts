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

type AuditLogStore = {
    records: AuditLogRecord[];
};

const seedAuditLogs: AuditLogRecord[] = [
    {
        id: "audit:bootstrap:tenant-tamilnadu",
        tenantId: "tenant-tamilnadu",
        actorId: "platform-admin",
        action: "tenant.bootstrap",
        entityType: "tenant",
        entityId: "tenant-tamilnadu",
        metadata: {
            source: "seed"
        },
        createdAt: "2026-01-05T00:00:00.000Z"
    }
];

const globalForAudit = globalThis as typeof globalThis & {
    __trackPromisesAuditStore?: AuditLogStore;
};

function createInitialStore(): AuditLogStore {
    return {
        records: [...seedAuditLogs]
    };
}

function createAuditLogId(action: string, entityId: string, createdAt: string) {
    return `audit:${action}:${entityId}:${createdAt}`;
}

export function getAuditLogStore() {
    if (!globalForAudit.__trackPromisesAuditStore) {
        globalForAudit.__trackPromisesAuditStore = createInitialStore();
    }

    return globalForAudit.__trackPromisesAuditStore;
}

export function listAuditLogsForTenant(tenantId: string) {
    return getAuditLogStore()
        .records.filter((record) => record.tenantId === tenantId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function appendAuditLog(record: Omit<AuditLogRecord, "id"> & { id?: string }) {
    const store = getAuditLogStore();
    const finalRecord: AuditLogRecord = {
        ...record,
        id: record.id ?? createAuditLogId(record.action, record.entityId, record.createdAt)
    };
    store.records.push(finalRecord);
    return finalRecord;
}

export function seedAuditLogRecords() {
    return seedAuditLogs;
}