import Link from "next/link";

import { getRequestMessages, getRequestLocale } from "@/modules/i18n/request";
import { localizeAppHref } from "@/modules/i18n/public-content-routes";
import { listTenants } from "@/modules/tenants/data";

export default async function HomePage() {
  const tenants = listTenants();
  const locale = await getRequestLocale();
  const messages = await getRequestMessages();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:px-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 bg-hero-grid p-8 shadow-card backdrop-blur sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">{messages.home.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-[var(--font-heading)] text-4xl leading-tight text-ink sm:text-6xl">
          {messages.home.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-ink/76 sm:text-lg">
          {messages.home.summary}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {tenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={localizeAppHref(`/${tenant.slug}`, locale)}
              className="group rounded-[1.5rem] border border-ink/10 bg-sand/80 p-5 transition hover:-translate-y-1 hover:border-moss/40 hover:shadow-card"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">
                    {tenant.jurisdictionType}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">{tenant.name}</h2>
                </div>
                <span className="rounded-full border border-ink/10 px-3 py-1 text-sm text-ink/70">
                  {tenant.slug}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-ink/70">{tenant.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
