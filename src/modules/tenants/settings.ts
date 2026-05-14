import { eq } from "drizzle-orm";

import { resolveTenantLocalizationSettings } from "@/config/resolve-config";
import { runQuery } from "@/db/client";
import { tenants as tenantsTable } from "@/db/schema";
import { appendAuditLog } from "@/modules/audit/logs";
import { type SupportedLocale } from "@/modules/i18n/config";
import { getTenantById, setTenantRuntimeDefaultLocale } from "@/modules/tenants/data";

export class TenantSettingsError extends Error {
    status: number;
    code: string;

    constructor(message: string, status: number, code: string) {
        super(message);
        this.name = "TenantSettingsError";
        this.status = status;
        this.code = code;
    }
}

export async function updateTenantDefaultLocale({
    tenantId,
    defaultLocale,
    actorId,
    now = new Date().toISOString()
}: {
    tenantId: string;
    defaultLocale: SupportedLocale;
    actorId: string;
    now?: string;
}) {
    const tenant = getTenantById(tenantId);

    if (!tenant) {
        throw new TenantSettingsError("Unknown tenant.", 404, "tenant_not_found");
    }

    const localization = resolveTenantLocalizationSettings(tenantId);

    if (!localization.supportedLocales.includes(defaultLocale)) {
        throw new TenantSettingsError(
            "The default browsing language must be one of the tenant's enabled locales.",
            400,
            "tenant_locale_not_enabled"
        );
    }

    await runQuery((db) =>
        db
            .update(tenantsTable)
            .set({
                defaultLocale,
                updatedAt: new Date(now)
            })
            .where(eq(tenantsTable.id, tenantId))
    );

    setTenantRuntimeDefaultLocale(tenantId, defaultLocale);

    await appendAuditLog({
        tenantId,
        actorId,
        action: "tenant.default_locale_updated",
        entityType: "tenant",
        entityId: tenantId,
        metadata: {
            previousDefaultLocale: tenant.defaultLocale,
            defaultLocale,
            supportedLocales: localization.supportedLocales
        },
        createdAt: now
    });

    const updatedTenant = getTenantById(tenantId);

    if (!updatedTenant) {
        throw new TenantSettingsError("Unknown tenant.", 404, "tenant_not_found");
    }

    return updatedTenant;
}