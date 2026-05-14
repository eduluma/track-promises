import { redirect } from "next/navigation";

import { TenantLocaleSettingsPanel } from "@/components/admin/tenant-locale-settings-panel";
import { resolveTenantLocalizationSettings } from "@/config/resolve-config";
import { canAccessTenant, canManagePromises } from "@/lib/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { getLocalizedHref, getRequestMessages } from "@/modules/i18n/request";
import { listTenants } from "@/modules/tenants/data";

type TenantLocalizationPageProps = {
    searchParams: Promise<{ tenant?: string }>;
};

export default async function TenantLocalizationPage({ searchParams }: TenantLocalizationPageProps) {
    const user = await getCurrentUser();
    const messages = await getRequestMessages();
    const localizationHref = await getLocalizedHref("/admin/tenants/localization");
    const homeHref = await getLocalizedHref("/");

    if (!user) {
        redirect(await getLocalizedHref(`/login?redirectTo=${encodeURIComponent(localizationHref)}`));
    }

    if (!canManagePromises(user)) {
        redirect(homeHref);
    }

    const { tenant } = await searchParams;
    const allowedTenants = listTenants().filter((candidate) => canAccessTenant(user, candidate.id));
    const activeTenant = allowedTenants.find((candidate) => candidate.slug === tenant) ?? allowedTenants[0];

    if (!activeTenant) {
        redirect(homeHref);
    }

    const settingsByTenant = Object.fromEntries(
        allowedTenants.map((candidate) => [candidate.slug, resolveTenantLocalizationSettings(candidate.id)])
    );

    return (
        <main className="mx-auto flex max-w-6xl flex-col px-6 py-10 sm:px-10">
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">{messages.admin.eyebrow}</p>
                <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-ink">{messages.admin.tenantLocalesTitle}</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-ink/72">{messages.admin.tenantLocalesSummary}</p>

                <TenantLocaleSettingsPanel
                    tenants={allowedTenants}
                    initialTenantSlug={activeTenant.slug}
                    settingsByTenant={settingsByTenant}
                    baseHref={localizationHref}
                    messages={{
                        pending: messages.admin.tenantLocalesPending,
                        constraintsTitle: messages.admin.tenantLocalesConstraintsTitle,
                        primaryLabel: messages.admin.tenantLocalesPrimaryLabel,
                        supportedLabel: messages.admin.tenantLocalesSupportedLabel,
                        availableLabel: messages.admin.tenantLocalesAvailableLabel,
                        saveIdle: messages.admin.tenantLocalesSaveIdle,
                        savePending: messages.admin.tenantLocalesSavePending,
                        saveSuccess: messages.admin.tenantLocalesSaveSuccess,
                        saveError: messages.admin.tenantLocalesSaveError
                    }}
                />
            </section>
        </main>
    );
}