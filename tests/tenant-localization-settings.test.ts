import { afterEach, describe, expect, it } from "vitest";

import { resolveTenantLocalizationSettings } from "@/config/resolve-config";
import { handleUpdateTenantLocalization } from "@/modules/api/handlers";
import { getTenantById, resetTenantRuntimeOverrides } from "@/modules/tenants/data";

const platformAdmin = {
    id: "platform-admin",
    email: "admin@track-promises.local",
    emailVerified: true,
    state: "moderator_approved" as const,
    role: "platform_admin" as const,
    tenantIds: []
};

const tenantEditor = {
    id: "editor-user",
    email: "editor@track-promises.local",
    emailVerified: true,
    state: "moderator_approved" as const,
    role: "promise_editor" as const,
    tenantIds: ["tenant-tamilnadu"]
};

afterEach(async () => {
    const tenant = getTenantById("tenant-tamilnadu");

    if (tenant?.defaultLocale !== "ta") {
        await handleUpdateTenantLocalization(
            {
                tenantSlug: "tamilnadu",
                defaultLocale: "ta"
            },
            platformAdmin
        );
    }

    resetTenantRuntimeOverrides();
});

describe("tenant localization settings", () => {
    it("allows an authorized admin to change the tenant default browsing locale", async () => {
        const result = await handleUpdateTenantLocalization(
            {
                tenantSlug: "tamilnadu",
                defaultLocale: "en"
            },
            platformAdmin
        );

        expect(result.status).toBe(200);
        expect(result.payload).toEqual({
            tenantSlug: "tamilnadu",
            defaultLocale: "en"
        });
        expect(resolveTenantLocalizationSettings("tenant-tamilnadu").primaryLocale).toBe("en");
    });

    it("rejects a default browsing locale that is not enabled for the tenant", async () => {
        const result = await handleUpdateTenantLocalization(
            {
                tenantSlug: "tamilnadu",
                defaultLocale: "ml"
            },
            platformAdmin
        );

        expect(result.status).toBe(400);
        expect(result.payload).toEqual({
            error: "The default browsing language must be one of the tenant's enabled locales.",
            code: "tenant_locale_not_enabled"
        });
    });

    it("rejects tenant locale updates from users without access to that tenant", async () => {
        const result = await handleUpdateTenantLocalization(
            {
                tenantSlug: "kerala",
                defaultLocale: "en"
            },
            tenantEditor
        );

        expect(result.status).toBe(403);
        expect(result.payload).toEqual({ error: "This account cannot manage that tenant." });
    });
});