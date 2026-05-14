import type { TenantConfig } from "@/config/schemas";
import type { Tenant } from "@/modules/tenants/data";

type TenantHeroProps = {
  tenant: Tenant;
  config: TenantConfig;
  promiseCount: number;
  reviewCount: number;
};

export function TenantHero({ tenant, config, promiseCount, reviewCount }: TenantHeroProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/70 p-8 shadow-card backdrop-blur sm:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay">{tenant.jurisdictionType} Workspace</p>
          <h1 className="mt-3 font-[var(--font-heading)] text-4xl leading-tight text-ink sm:text-5xl">
            {tenant.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/75">{tenant.tagline}</p>
        </div>
        <div className="grid min-w-[14rem] gap-3 text-sm text-ink/75">
          <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-moss">Config-driven status</p>
            <p className="mt-2">{config.statuses.join(", ")}</p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-moss">Open records</p>
            <p className="mt-2">{promiseCount} promises · {reviewCount} moderation reviews</p>
          </div>
        </div>
      </div>
    </section>
  );
}
