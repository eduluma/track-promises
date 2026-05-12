import { redirect } from "next/navigation";

import { ReviewQueue } from "@/components/moderation/review-queue";
import { canAccessTenant, canReviewModeration } from "@/lib/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { listModerationReviewsForTenant } from "@/modules/moderation/reviews";
import { getTrustProfileForUser } from "@/modules/moderation/trust";
import { listTenants } from "@/modules/tenants/data";

type ModerationPageProps = {
    searchParams: Promise<{ tenant?: string }>;
};

export default async function ModerationPage({ searchParams }: ModerationPageProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login?redirectTo=/admin/moderation");
    }

    if (!canReviewModeration(user)) {
        redirect("/");
    }

    const { tenant } = await searchParams;
    const allowedTenants = listTenants().filter((candidate) => canAccessTenant(user, candidate.id));
    const activeTenant = allowedTenants.find((candidate) => candidate.slug === tenant) ?? allowedTenants[0];

    if (!activeTenant) {
        redirect("/");
    }

    const reviews = await listModerationReviewsForTenant(activeTenant.id);
    const trustProfileEntries = await Promise.all(
        reviews.map(async (review) => {
            const userId = review.metadata.userId ?? review.subjectId;
            return [userId, await getTrustProfileForUser(userId, activeTenant.id)] as const;
        })
    );
    const trustProfiles = Object.fromEntries(trustProfileEntries);

    return (
        <main className="mx-auto flex max-w-5xl flex-col px-6 py-10 sm:px-10">
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">Moderation</p>
                <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-ink">Review queue</h1>
                <p className="mt-4 text-base leading-7 text-ink/72">
                    Trust-score signals now combine email verification, account age, review backlog, and abuse flags to support moderator decisions.
                </p>
                <div className="mt-6">
                    <ReviewQueue reviews={reviews} trustProfiles={trustProfiles} />
                </div>
            </section>
        </main>
    );
}