import { notFound } from "next/navigation";

import { PromiseCard } from "@/components/promises/promise-card";
import { TenantHero } from "@/components/tenants/tenant-hero";
import { TableFilter } from "@/components/ui/table-filter";
import { getOpenModerationReviewsForTenant } from "@/modules/moderation/reviews";
import { listPromisesForTenant } from "@/modules/promises/repository";
import { getCurrentUser } from "@/modules/auth/session";
import { getTenantBySlug } from "@/modules/tenants/data";
import { resolveTenantConfig } from "@/config/resolve-config";

type TenantPageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ category?: string; status?: string }>;
};

export default async function TenantPage({ params, searchParams }: TenantPageProps) {
  const { tenantSlug } = await params;
  const { category, status } = await searchParams;
  const tenant = getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const user = await getCurrentUser();
  const config = resolveTenantConfig(tenant.id);
  const promises = listPromisesForTenant(tenant.id, {
    userId: user?.id ?? null,
    category: category ?? null,
    status: status && config.statuses.includes(status as (typeof config.statuses)[number]) ? (status as (typeof config.statuses)[number]) : null
  });
  const reviews = getOpenModerationReviewsForTenant(tenant.id);
  const sharedSearchParams = {
    category,
    status
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10">
      <TenantHero tenant={tenant} config={config} promiseCount={promises.length} reviewCount={reviews.length} />
      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <TableFilter
          label="Category"
          queryKey="category"
          currentValue={category ?? null}
          options={config.categories}
          pathname={`/${tenant.slug}`}
          searchParams={sharedSearchParams}
        />
        <TableFilter
          label="Status"
          queryKey="status"
          currentValue={status ?? null}
          options={config.statuses}
          pathname={`/${tenant.slug}`}
          searchParams={sharedSearchParams}
        />
      </section>
      <section className="mt-10 grid gap-6">
        {promises.map((promise) => (
          <PromiseCard key={promise.id} tenantSlug={tenant.slug} promise={promise} />
        ))}
      </section>
    </main>
  );
}
