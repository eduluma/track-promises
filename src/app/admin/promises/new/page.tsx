import { redirect } from "next/navigation";

import { PromiseAdminForm } from "@/components/admin/promise-admin-form";
import { platformDefaults } from "@/config/defaults";
import { canManagePromises } from "@/lib/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { resolveTenantConfig } from "@/config/resolve-config";
import { listTenants } from "@/modules/tenants/data";

export default async function NewPromisePage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login?redirectTo=/admin/promises/new");
    }

    if (!canManagePromises(user)) {
        redirect("/");
    }

    const tenants = listTenants().filter((tenant) => user.role === "platform_admin" || user.tenantIds.includes(tenant.id));
    const defaultTenantSlug = tenants[0]?.slug ?? "";
    const categoriesByTenant = Object.fromEntries(
        tenants.map((tenant) => [tenant.slug, resolveTenantConfig(tenant.id).categories])
    );

    return (
        <main className="mx-auto flex max-w-4xl flex-col px-6 py-10 sm:px-10">
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">Admin</p>
                <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-ink">Create a promise</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-ink/72">
                    This form keeps promise creation limited to editor and admin roles while reusing tenant configuration for categories and statuses.
                </p>
                <PromiseAdminForm
                    tenants={tenants}
                    defaultTenantSlug={defaultTenantSlug}
                    categoriesByTenant={categoriesByTenant}
                    statuses={platformDefaults.statuses}
                />
            </section>
        </main>
    );
}