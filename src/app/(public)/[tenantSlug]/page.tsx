import { notFound, redirect } from "next/navigation";

import { getTenantBySlug } from "@/modules/tenants/data";
import { getDefaultTimelineForTenant } from "@/modules/timelines/data";

type TenantPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenantSlug } = await params;
  const tenant = getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const timeline = getDefaultTimelineForTenant(tenant.id);

  if (!timeline) {
    notFound();
  }

  redirect(`/${tenant.slug}/${timeline.slug}`);
}
