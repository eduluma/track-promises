import type { PromiseSource } from "@/modules/promises/data";

type SourceListProps = {
  sources: PromiseSource[];
};

export function SourceList({ sources }: SourceListProps) {
  return (
    <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-5">
      <h2 className="text-lg font-semibold text-ink">Sources</h2>
      <div className="mt-4 space-y-4">
        {sources.map((source) => (
          <article key={source.id} className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{source.publisher}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/50">
                  Captured {new Date(source.capturedAt).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full border border-ink/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-moss">
                {source.verificationStatus === "verified" ? "verified source" : "verification pending"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/72">{source.excerpt}</p>
            <a href={source.url} className="mt-4 inline-flex text-sm font-medium text-clay underline-offset-4 hover:underline">
              Open source record
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
