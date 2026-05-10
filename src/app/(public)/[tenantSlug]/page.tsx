import { notFound } from "next/navigation";

import { PromiseCard } from "@/components/promises/promise-card";
import { TenantHero } from "@/components/tenants/tenant-hero";
import { getOpenModerationReviewsForTenant } from "@/modules/moderation/reviews";
import { listPromisesForTenant } from "@/modules/promises/repository";
import { getTenantBySlug } from "@/modules/tenants/data";
import { resolveTenantConfig } from "@/config/resolve-config";

type TenantPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenantSlug } = await params;
  const tenant = getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const config = resolveTenantConfig(tenant.id);
  const promises = listPromisesForTenant(tenant.id);
  const reviews = getOpenModerationReviewsForTenant(tenant.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10">
      <TenantHero tenant={tenant} config={config} promiseCount={promises.length} reviewCount={reviews.length} />
      <section className="mt-10 grid gap-6">
        {promises.map((promise) => (
          <PromiseCard key={promise.id} tenantSlug={tenant.slug} promise={promise} />
        ))}
      </section>
    </main>
  );
}
