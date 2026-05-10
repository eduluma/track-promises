"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { PromiseStatus } from "@/config/schemas";
import type { Tenant } from "@/modules/tenants/data";

type PromiseAdminFormProps = {
    tenants: Tenant[];
    defaultTenantSlug: string;
    categoriesByTenant: Record<string, string[]>;
    statuses: PromiseStatus[];
};

export function PromiseAdminForm({ tenants, defaultTenantSlug, categoriesByTenant, statuses }: PromiseAdminFormProps) {
    const router = useRouter();
    const [tenantSlug, setTenantSlug] = useState(defaultTenantSlug);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const categories = categoriesByTenant[tenantSlug] ?? [];

    return (
        <form
            className="mt-8 grid gap-4"
            onSubmit={(event) => {
                event.preventDefault();
                setErrorMessage(null);

                const formData = new FormData(event.currentTarget);

                startTransition(async () => {
                    const response = await fetch("/api/admin/promises", {
                        method: "POST",
                        body: JSON.stringify(Object.fromEntries(formData.entries())),
                        headers: {
                            "content-type": "application/json"
                        }
                    });

                    const payload = await response.json();

                    if (!response.ok) {
                        setErrorMessage(payload.error ?? "Promise creation failed.");
                        return;
                    }

                    router.push(`/${payload.tenantSlug}/promises/${payload.promise.id}`);
                    router.refresh();
                });
            }}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-ink">
                    Tenant
                    <select
                        name="tenantSlug"
                        value={tenantSlug}
                        onChange={(event) => setTenantSlug(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm"
                    >
                        {tenants.map((tenant) => (
                            <option key={tenant.id} value={tenant.slug}>
                                {tenant.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-sm font-medium text-ink">
                    Category
                    <select name="category" className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm">
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <label className="text-sm font-medium text-ink">
                Title
                <input name="title" required className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="text-sm font-medium text-ink">
                Description
                <textarea
                    name="description"
                    required
                    rows={5}
                    className="mt-2 w-full rounded-[1.5rem] border border-ink/15 bg-white px-4 py-3 text-sm"
                />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-medium text-ink">
                    Jurisdiction
                    <input
                        name="jurisdiction"
                        required
                        className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm"
                    />
                </label>
                <label className="text-sm font-medium text-ink">
                    Election
                    <input name="election" required className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm" />
                </label>
                <label className="text-sm font-medium text-ink">
                    Person or party
                    <input
                        name="personParty"
                        required
                        className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm"
                    />
                </label>
            </div>
            <label className="text-sm font-medium text-ink">
                Initial status
                <select name="status" defaultValue="planned" className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm">
                    {statuses.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </label>
            <button
                type="submit"
                disabled={isPending}
                className="rounded-2xl bg-clay px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-clay/40"
            >
                {isPending ? "Creating promise..." : "Create promise"}
            </button>
            {errorMessage ? <p className="text-sm font-medium text-[#b42318]">{errorMessage}</p> : null}
        </form>
    );
}