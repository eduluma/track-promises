import type { PromiseDeliveryPlan } from "@/modules/promises/data";

type PromiseDeliveryPlanProps = {
    deliveryPlan: PromiseDeliveryPlan;
};

function formatModelLabel(model: PromiseDeliveryPlan["model"]) {
    return model.replaceAll("_", " ");
}

function formatCheckpointStatus(status: PromiseDeliveryPlan["checkpoints"][number]["status"]) {
    return status.replaceAll("_", " ");
}

export function PromiseDeliveryPlanPanel({ deliveryPlan }: PromiseDeliveryPlanProps) {
    return (
        <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">Delivery tracking</p>
                    <h2 className="mt-2 text-lg font-semibold text-ink">How this promise should be monitored</h2>
                </div>
                <span className="rounded-full border border-ink/10 bg-white/75 px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink/60">
                    {formatModelLabel(deliveryPlan.model)}
                </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-ink/72">{deliveryPlan.summary}</p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-ink/72">
                {deliveryPlan.cadenceLabel ? <span className="rounded-full bg-white/75 px-3 py-1">Cadence: {deliveryPlan.cadenceLabel}</span> : null}
                {deliveryPlan.targetLabel ? <span className="rounded-full bg-white/75 px-3 py-1">Target: {deliveryPlan.targetLabel}</span> : null}
                {deliveryPlan.currentPhaseLabel ? <span className="rounded-full bg-white/75 px-3 py-1">Current phase: {deliveryPlan.currentPhaseLabel}</span> : null}
            </div>

            {deliveryPlan.checkpoints.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {deliveryPlan.checkpoints.map((checkpoint) => (
                        <article key={`${checkpoint.label}:${checkpoint.dueAt ?? checkpoint.completedAt ?? "pending"}`} className="rounded-2xl border border-ink/10 bg-white/70 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="font-medium text-ink">{checkpoint.label}</p>
                                <span className="rounded-full border border-ink/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-moss">
                                    {formatCheckpointStatus(checkpoint.status)}
                                </span>
                            </div>
                            {checkpoint.description ? <p className="mt-3 text-sm leading-6 text-ink/72">{checkpoint.description}</p> : null}
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/62">
                                {checkpoint.dueAt ? <span className="rounded-full bg-sand px-3 py-1">Due {new Date(checkpoint.dueAt).toLocaleDateString()}</span> : null}
                                {checkpoint.completedAt ? <span className="rounded-full bg-sand px-3 py-1">Completed {new Date(checkpoint.completedAt).toLocaleDateString()}</span> : null}
                            </div>
                        </article>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
