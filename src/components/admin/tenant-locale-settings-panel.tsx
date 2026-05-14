"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { localeMetadata, supportedLocaleCodes, type SupportedLocale } from "@/modules/i18n/config";
import type { TenantLocalizationSettings } from "@/config/resolve-config";
import type { Tenant } from "@/modules/tenants/data";

type TenantLocaleSettingsPanelProps = {
    tenants: Tenant[];
    initialTenantSlug: string;
    settingsByTenant: Record<string, TenantLocalizationSettings>;
    baseHref: string;
    messages: {
        pending: string;
        constraintsTitle: string;
        primaryLabel: string;
        supportedLabel: string;
        availableLabel: string;
        saveIdle: string;
        savePending: string;
        saveSuccess: string;
        saveError: string;
    };
};

function LocaleBadge({ locale, tone = "default" }: { locale: SupportedLocale; tone?: "default" | "muted" | "primary" }) {
    const palette = tone === "primary"
        ? "border-clay/30 bg-clay/10 text-clay"
        : tone === "muted"
            ? "border-ink/10 bg-white/60 text-ink/60"
            : "border-moss/20 bg-moss/10 text-moss";

    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${palette}`}>
            <span className="font-semibold uppercase tracking-[0.16em]">{locale}</span>
            <span>{localeMetadata[locale].nativeLabel}</span>
        </span>
    );
}

export function TenantLocaleSettingsPanel({ tenants, initialTenantSlug, settingsByTenant, baseHref, messages }: TenantLocaleSettingsPanelProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fallbackTenant = tenants[0]!;
    const activeTenantSlug = searchParams.get("tenant") ?? initialTenantSlug;
    const activeTenant = tenants.find((tenant) => tenant.slug === activeTenantSlug) ?? fallbackTenant;
    const settings = settingsByTenant[activeTenant.slug] ?? settingsByTenant[initialTenantSlug]!;

    const enabled = new Set(settings.supportedLocales);
    const [defaultLocale, setDefaultLocale] = useState(settings.primaryLocale);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setDefaultLocale(settings.primaryLocale);
        setFeedbackMessage(null);
        setErrorMessage(null);
    }, [activeTenant.slug, settings.primaryLocale]);

    return (
        <div className="mt-8 space-y-6">
            <div className="flex flex-wrap gap-3">
                {tenants.map((tenant) => {
                    const isActive = tenant.slug === activeTenant.slug;
                    const href = `${baseHref}?tenant=${encodeURIComponent(tenant.slug)}`;

                    return (
                        <button
                            key={tenant.id}
                            type="button"
                            onClick={() => router.push(href as `/${string}`)}
                            className={`rounded-full border px-4 py-2 text-sm transition ${isActive ? "border-clay/30 bg-clay text-white" : "border-ink/10 bg-white/80 text-ink/75 hover:border-clay/25 hover:text-ink"}`}
                        >
                            {tenant.name}
                        </button>
                    );
                })}
            </div>

            <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                <article className="rounded-[1.75rem] border border-ink/10 bg-sand/60 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.2em] text-ink/45">{activeTenant.jurisdictionType}</p>
                            <h2 className="mt-2 text-2xl font-semibold text-ink">{activeTenant.name}</h2>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">{messages.pending}</p>
                        </div>
                        <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.18em] text-ink/55">
                            {activeTenant.slug}
                        </span>
                    </div>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <div className="rounded-[1.5rem] border border-ink/10 bg-white/80 p-5">
                            <p className="text-sm font-medium text-ink/70">{messages.primaryLabel}</p>
                            <div className="mt-3">
                                <LocaleBadge locale={settings.primaryLocale} tone="primary" />
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-ink/10 bg-white/80 p-5">
                            <p className="text-sm font-medium text-ink/70">{messages.supportedLabel}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {settings.supportedLocales.map((locale) => (
                                    <LocaleBadge key={locale} locale={locale} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-[1.5rem] border border-ink/10 bg-white/80 p-5">
                        <p className="text-sm font-medium text-ink/70">{messages.availableLabel}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {supportedLocaleCodes.map((locale) => (
                                <LocaleBadge key={locale} locale={locale} tone={enabled.has(locale) ? "default" : "muted"} />
                            ))}
                        </div>
                    </div>

                    <form
                        className="mt-5 rounded-[1.5rem] border border-ink/10 bg-white/80 p-5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            setFeedbackMessage(null);
                            setErrorMessage(null);

                            startTransition(async () => {
                                const response = await fetch("/api/admin/tenants/localization", {
                                    method: "POST",
                                    headers: {
                                        "content-type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        tenantSlug: activeTenant.slug,
                                        defaultLocale
                                    })
                                });

                                const payload = await response.json();

                                if (!response.ok) {
                                    setErrorMessage(payload.error ?? messages.saveError);
                                    return;
                                }

                                setFeedbackMessage(messages.saveSuccess);
                                router.refresh();
                            });
                        }}
                    >
                        <label className="text-sm font-medium text-ink">
                            {messages.primaryLabel}
                            <select
                                value={defaultLocale}
                                onChange={(event) => setDefaultLocale(event.target.value as SupportedLocale)}
                                className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm"
                            >
                                {settings.supportedLocales.map((locale) => (
                                    <option key={locale} value={locale}>
                                        {localeMetadata[locale].label} · {localeMetadata[locale].nativeLabel}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                                type="submit"
                                disabled={isPending || defaultLocale === settings.primaryLocale}
                                className="rounded-2xl bg-clay px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-clay/40"
                            >
                                {isPending ? messages.savePending : messages.saveIdle}
                            </button>
                            {feedbackMessage ? <p className="text-sm font-medium text-moss">{feedbackMessage}</p> : null}
                            {errorMessage ? <p className="text-sm font-medium text-[#b42318]">{errorMessage}</p> : null}
                        </div>
                    </form>
                </article>

                <aside className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-6">
                    <h3 className="text-lg font-semibold text-ink">{messages.constraintsTitle}</h3>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-ink/72">
                        <li>English is mandatory for every tenant.</li>
                        <li>The primary locale must also be present in the enabled locale list.</li>
                        <li>State tenants can keep English plus a local language such as Tamil or Malayalam.</li>
                        <li>Country-wide tenants can enable more than one additional language.</li>
                    </ul>
                </aside>
            </section>
        </div>
    );
}