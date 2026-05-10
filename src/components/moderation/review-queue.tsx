"use client";

import { useState, useTransition } from "react";

import type { ModerationReview } from "@/modules/moderation/reviews";
import type { TrustProfile } from "@/modules/moderation/trust";

type ReviewQueueProps = {
    reviews: ModerationReview[];
    trustProfiles: Record<string, TrustProfile | null>;
};

export function ReviewQueue({ reviews, trustProfiles }: ReviewQueueProps) {
    const [localReviews, setLocalReviews] = useState(reviews);
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const resolveReview = (reviewId: string, decision: "approve_account" | "limit_account" | "dismiss") => {
        startTransition(async () => {
            setErrorMessage(null);
            const response = await fetch(`/api/admin/moderation/reviews/${reviewId}`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ decision })
            });

            const payload = await response.json();

            if (!response.ok) {
                setErrorMessage(payload.error ?? "Review resolution failed.");
                return;
            }

            setLocalReviews((current) => current.map((review) => (review.id === reviewId ? payload.review : review)));
        });
    };

    return (
        <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-5">
            <h2 className="text-lg font-semibold text-ink">Moderation review queue</h2>
            <div className="mt-4 space-y-4">
                {localReviews.map((review) => {
                    const trustProfile = trustProfiles[review.metadata.userId ?? review.subjectId] ?? null;

                    return (
                        <article key={review.id} className="rounded-2xl border border-ink/10 bg-white/70 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-ink">{review.reason}</p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/55">
                                        {review.subjectType} · {review.subjectId} · {review.status.replaceAll("_", " ")}
                                    </p>
                                </div>
                                <span className="rounded-full border border-ink/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-moss">
                                    {review.decision ?? "pending"}
                                </span>
                            </div>

                            {trustProfile ? (
                                <div className="mt-4 rounded-2xl border border-ink/10 bg-sand/80 p-4 text-sm text-ink/72">
                                    <p className="font-medium text-ink">
                                        {trustProfile.displayName} · current {trustProfile.currentScore} · recommended {trustProfile.recommendedScore}
                                    </p>
                                    <p className="mt-2 capitalize">Band: {trustProfile.band}</p>
                                    <div className="mt-3 grid gap-2">
                                        {trustProfile.signals.map((signal) => (
                                            <div key={signal.label} className="flex items-start justify-between gap-4 rounded-xl bg-white/70 px-3 py-2">
                                                <div>
                                                    <p className="font-medium text-ink">{signal.label}</p>
                                                    <p className="text-xs text-ink/60">{signal.description}</p>
                                                </div>
                                                <span className={`text-sm font-semibold ${signal.delta >= 0 ? "text-moss" : "text-[#b42318]"}`}>
                                                    {signal.delta >= 0 ? `+${signal.delta}` : signal.delta}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {review.status !== "resolved" ? (
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => resolveReview(review.id, "approve_account")}
                                        disabled={isPending}
                                        className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-moss/40"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => resolveReview(review.id, "limit_account")}
                                        disabled={isPending}
                                        className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-clay/40"
                                    >
                                        Limit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => resolveReview(review.id, "dismiss")}
                                        disabled={isPending}
                                        className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink/75 disabled:cursor-not-allowed disabled:text-ink/40"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            ) : null}
                        </article>
                    );
                })}
            </div>
            {errorMessage ? <p className="mt-4 text-sm font-medium text-[#b42318]">{errorMessage}</p> : null}
        </section>
    );
}