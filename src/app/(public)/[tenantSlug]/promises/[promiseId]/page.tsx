import { notFound, redirect } from "next/navigation";

import { getPromiseById } from "@/modules/promises/repository";
import { getTenantBySlug } from "@/modules/tenants/data";

type PromiseDetailPageProps = {
  params: Promise<{ tenantSlug: string; promiseId: string }>;
};

export default async function PromiseDetailPage({ params }: PromiseDetailPageProps) {
  const { tenantSlug, promiseId } = await params;
  const tenant = getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const promise = getPromiseById(tenant.id, promiseId);

  if (!promise) {
    notFound();
  }

  redirect(`/${tenant.slug}/${promise.timelineSlug}/promises/${promise.id}`);
}
