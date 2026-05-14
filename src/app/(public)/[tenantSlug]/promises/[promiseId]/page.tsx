import { notFound, redirect } from "next/navigation";

import { localizeAppHref } from "@/modules/i18n/public-content-routes";
import { getRequestLocale } from "@/modules/i18n/request";
import { getPromiseById } from "@/modules/promises/repository";
import { getTenantBySlug } from "@/modules/tenants/data";

type PromiseDetailPageProps = {
  params: Promise<{ tenantSlug: string; promiseId: string }>;
};

export default async function PromiseDetailPage({ params }: PromiseDetailPageProps) {
  const { tenantSlug, promiseId } = await params;
  const locale = await getRequestLocale();
  const tenant = getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const promise = getPromiseById(tenant.id, promiseId);

  if (!promise) {
    notFound();
  }

  redirect(localizeAppHref(`/${tenant.slug}/${promise.timelineSlug}/promises/${promise.id}`, locale));
}
