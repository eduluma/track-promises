import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CommunityAttestationWitnessForm } from "@/app/account/account-actions";
import { canWitnessCommunityAttestation, getCommunityAttestationSummary } from "@/modules/auth/community-attestations";
import { getCurrentUser } from "@/modules/auth/session";
import { getLocalizedHref, getRequestMessages } from "@/modules/i18n/request";

type AttestationWitnessPageProps = {
    params: Promise<{ reviewId: string }>;
};

export default async function CommunityAttestationWitnessPage({ params }: AttestationWitnessPageProps) {
    const user = await getCurrentUser();
    const messages = await getRequestMessages();
    const { reviewId } = await params;
    const summary = await getCommunityAttestationSummary(reviewId);

    if (!summary) {
        notFound();
    }

    const accountHref = await getLocalizedHref("/account");

    if (!user) {
        redirect(await getLocalizedHref(`/login?redirectTo=${encodeURIComponent(await getLocalizedHref(`/account/community-attestation/${reviewId}`))}`));
    }

    const hasAlreadyWitnessed = summary.witnesses.some((witness) => witness.witnessUserId === user.id);
    const canWitness = user.id !== summary.subjectUserId
        && summary.status !== "resolved"
        && !hasAlreadyWitnessed
        && canWitnessCommunityAttestation(user);

    return (
        <main className="mx-auto flex max-w-3xl flex-col px-6 py-10 sm:px-10">
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                    {messages.account.communityAttestationWitnessEyebrow}
                </p>
                <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-ink">
                    {messages.account.communityAttestationWitnessTitle}
                </h1>
                <p className="mt-4 text-base leading-7 text-ink/72">
                    {messages.account.communityAttestationWitnessSummary.replace("{name}", summary.subjectDisplayName)}
                </p>

                <div className="mt-6 rounded-2xl border border-ink/10 bg-sand/70 p-5 text-sm text-ink/72">
                    <p className="font-medium text-ink">{messages.account.communityAttestationDetailsTitle}</p>
                    <p className="mt-2">{messages.account.communityAttestationRequestLocation.replace("{city}", summary.request.city)}</p>
                    {summary.request.locality ? <p className="mt-1">{summary.request.locality}</p> : null}
                    {summary.request.postalCode ? <p className="mt-1">{summary.request.postalCode}</p> : null}
                    {summary.request.statement ? <p className="mt-3 italic text-ink/65">&ldquo;{summary.request.statement}&rdquo;</p> : null}
                    <p className="mt-4 text-xs uppercase tracking-[0.16em] text-ink/50">
                        {messages.account.communityAttestationWitnessCount.replace("{count}", String(summary.eligibleWitnessCount)).replace("{threshold}", String(summary.witnessThreshold))}
                    </p>
                </div>

                {summary.status === "resolved" ? (
                    <p className="mt-6 rounded-xl bg-moss/10 px-4 py-3 text-sm text-moss">
                        {messages.account.communityAttestationResolvedMessage}
                    </p>
                ) : null}
                {hasAlreadyWitnessed ? (
                    <p className="mt-6 rounded-xl bg-moss/10 px-4 py-3 text-sm text-moss">
                        {messages.account.communityAttestationAlreadyWitnessed}
                    </p>
                ) : null}
                {!canWitness && summary.status !== "resolved" && !hasAlreadyWitnessed ? (
                    <p className="mt-6 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
                        {messages.account.communityAttestationCannotWitness}
                    </p>
                ) : null}

                {canWitness ? (
                    <div className="mt-6">
                        <CommunityAttestationWitnessForm reviewId={reviewId} messages={messages.account.communityAttestationWitnessForm} />
                    </div>
                ) : null}

                <div className="mt-6">
                    <Link href={accountHref} className="text-sm font-medium text-moss underline-offset-2 hover:underline">
                        {messages.account.backToAccount}
                    </Link>
                </div>
            </section>
        </main>
    );
}
