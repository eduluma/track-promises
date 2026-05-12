import { redirect } from "next/navigation";

import { AuditLogPanel } from "@/components/admin/audit-log-panel";
import { canAccessTenant, canManagePromises } from "@/lib/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { listAuditLogsForTenant } from "@/modules/audit/logs";
import { listTenants } from "@/modules/tenants/data";

type AuditPageProps = {
    searchParams: Promise<{ tenant?: string }>;
};

export default async function AuditPage({ searchParams }: AuditPageProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login?redirectTo=/admin/audit");
    }

    if (!canManagePromises(user)) {
        redirect("/");
    }

    const { tenant } = await searchParams;
    const allowedTenants = listTenants().filter((candidate) => canAccessTenant(user, candidate.id));
    const activeTenant = allowedTenants.find((candidate) => candidate.slug === tenant) ?? allowedTenants[0];

    return (
        <main className="mx-auto flex max-w-5xl flex-col px-6 py-10 sm:px-10">
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">Admin</p>
                <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-ink">Audit activity</h1>
                <p className="mt-4 text-base leading-7 text-ink/72">
                    Track promise creation, moderation decisions, snapshot captures, and reconciliation runs by tenant.
                </p>
                {activeTenant ? <AuditLogPanel logs={await listAuditLogsForTenant(activeTenant.id)} /> : null}
            </section>
        </main>
    );
}