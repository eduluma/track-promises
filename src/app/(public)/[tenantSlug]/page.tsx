import { notFound, redirect } from "next/navigation";

import { getRequestLocale } from "@/modules/i18n/request";
import { localizeAppHref } from "@/modules/i18n/public-content-routes";
import { getTenantBySlug } from "@/modules/tenants/data";
import { getDefaultTimelineForTenant } from "@/modules/timelines/data";

type TenantPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenantSlug } = await params;
  const tenant = getTenantBySlug(tenantSlug);
  const locale = await getRequestLocale();

  if (!tenant) {
    notFound();
  }

  const timeline = getDefaultTimelineForTenant(tenant.id, locale);

  if (!timeline) {
    notFound();
  }

  redirect(localizeAppHref(`/${tenant.slug}/${timeline.slug}`, locale));
}
