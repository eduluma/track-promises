import { redirect } from "next/navigation";

import { PromiseAdminForm } from "@/components/admin/promise-admin-form";
import { platformDefaults } from "@/config/defaults";
import { canManagePromises } from "@/lib/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { getLocalizedHref, getRequestMessages } from "@/modules/i18n/request";
import { resolveTenantConfig } from "@/config/resolve-config";
import { listTenants } from "@/modules/tenants/data";
import { listTimelinesForTenant } from "@/modules/timelines/data";

export default async function NewPromisePage() {
    const user = await getCurrentUser();
    const messages = await getRequestMessages();
    const newPromiseHref = await getLocalizedHref("/admin/promises/new");
    const homeHref = await getLocalizedHref("/");

    if (!user) {
        redirect(await getLocalizedHref(`/login?redirectTo=${encodeURIComponent(newPromiseHref)}`));
    }

    if (!canManagePromises(user)) {
        redirect(homeHref);
    }

    const tenants = listTenants().filter((tenant) => user.role === "platform_admin" || user.tenantIds.includes(tenant.id));
    const defaultTenantSlug = tenants[0]?.slug ?? "";
    const categoriesByTenant = Object.fromEntries(
        tenants.map((tenant) => [tenant.slug, resolveTenantConfig(tenant.id).categories])
    );
    const timelinesByTenant = Object.fromEntries(
        tenants.map((tenant) => [tenant.slug, listTimelinesForTenant(tenant.id).map((timeline) => ({ slug: timeline.slug, title: timeline.title }))])
    );

    return (
        <main className="mx-auto flex max-w-4xl flex-col px-6 py-10 sm:px-10">
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">{messages.admin.eyebrow}</p>
                <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-ink">{messages.admin.createPromiseTitle}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-ink/72">
                    {messages.admin.createPromiseSummary}
                </p>
                <PromiseAdminForm
                    tenants={tenants}
                    defaultTenantSlug={defaultTenantSlug}
                    timelinesByTenant={timelinesByTenant}
                    categoriesByTenant={categoriesByTenant}
                    statuses={platformDefaults.statuses}
                />
            </section>
        </main>
    );
}