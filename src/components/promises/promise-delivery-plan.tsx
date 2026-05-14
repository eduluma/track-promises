import { getIntlLocale, type SupportedLocale } from "@/modules/i18n/config";
import { fillTemplate, type PublicUiMessages } from "@/modules/i18n/public-ui";
import type { PromiseDeliveryPlan } from "@/modules/promises/data";

type PromiseDeliveryPlanProps = {
    deliveryPlan: PromiseDeliveryPlan;
    locale: SupportedLocale;
    messages: PublicUiMessages;
};

export function PromiseDeliveryPlanPanel({ deliveryPlan, locale, messages }: PromiseDeliveryPlanProps) {
    const intlLocale = getIntlLocale(locale);

    return (
        <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">{messages.deliveryPlan.eyebrow}</p>
                    <h2 className="mt-2 text-lg font-semibold text-ink">{messages.deliveryPlan.title}</h2>
                </div>
                <span className="rounded-full border border-ink/10 bg-white/75 px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink/60">
                    {messages.deliveryPlan.modelLabels[deliveryPlan.model]}
                </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-ink/72">{deliveryPlan.summary}</p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-ink/72">
                {deliveryPlan.cadenceLabel ? <span className="rounded-full bg-white/75 px-3 py-1">{messages.deliveryPlan.cadence}: {deliveryPlan.cadenceLabel}</span> : null}
                {deliveryPlan.targetLabel ? <span className="rounded-full bg-white/75 px-3 py-1">{messages.deliveryPlan.target}: {deliveryPlan.targetLabel}</span> : null}
                {deliveryPlan.currentPhaseLabel ? <span className="rounded-full bg-white/75 px-3 py-1">{messages.deliveryPlan.currentPhase}: {deliveryPlan.currentPhaseLabel}</span> : null}
            </div>

            {deliveryPlan.checkpoints.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {deliveryPlan.checkpoints.map((checkpoint) => (
                        <article key={`${checkpoint.label}:${checkpoint.dueAt ?? checkpoint.completedAt ?? "pending"}`} className="rounded-2xl border border-ink/10 bg-white/70 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="font-medium text-ink">{checkpoint.label}</p>
                                <span className="rounded-full border border-ink/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-moss">
                                    {messages.deliveryPlan.checkpointStatusLabels[checkpoint.status]}
                                </span>
                            </div>
                            {checkpoint.description ? <p className="mt-3 text-sm leading-6 text-ink/72">{checkpoint.description}</p> : null}
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/62">
                                {checkpoint.dueAt ? <span className="rounded-full bg-sand px-3 py-1">{fillTemplate(messages.deliveryPlan.due, { date: new Date(checkpoint.dueAt).toLocaleDateString(intlLocale) })}</span> : null}
                                {checkpoint.completedAt ? <span className="rounded-full bg-sand px-3 py-1">{fillTemplate(messages.deliveryPlan.completed, { date: new Date(checkpoint.completedAt).toLocaleDateString(intlLocale) })}</span> : null}
                            </div>
                        </article>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
