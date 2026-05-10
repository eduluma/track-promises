import type { AuditLogRecord } from "@/modules/audit/logs";

type AuditLogPanelProps = {
    logs: AuditLogRecord[];
};

export function AuditLogPanel({ logs }: AuditLogPanelProps) {
    return (
        <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-5">
            <h2 className="text-lg font-semibold text-ink">Audit log</h2>
            <div className="mt-4 space-y-4">
                {logs.length === 0 ? (
                    <p className="text-sm text-ink/70">No audit entries recorded yet for this tenant.</p>
                ) : (
                    logs.map((log) => (
                        <article key={log.id} className="rounded-2xl border border-ink/10 bg-white/70 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-ink">{log.action}</p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/55">
                                        {log.entityType} · {log.entityId}
                                    </p>
                                </div>
                                <p className="text-xs text-ink/55">{new Date(log.createdAt).toLocaleString()}</p>
                            </div>
                            <pre className="mt-3 overflow-x-auto rounded-2xl bg-sand/80 p-3 text-xs leading-6 text-ink/68">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}