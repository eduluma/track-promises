import { getIntlLocale, type SupportedLocale } from "@/modules/i18n/config";
import { fillTemplate, type PublicUiMessages } from "@/modules/i18n/public-ui";
import type { PromiseSource } from "@/modules/promises/data";

type SourceListProps = {
  sources: PromiseSource[];
  locale: SupportedLocale;
  messages: PublicUiMessages;
};

export function SourceList({ sources, locale, messages }: SourceListProps) {
  const intlLocale = getIntlLocale(locale);

  return (
    <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-5">
      <h2 className="text-lg font-semibold text-ink">{messages.sources.title}</h2>
      <div className="mt-4 space-y-4">
        {sources.map((source) => (
          <article key={source.id} className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{source.publisher}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/50">
                  {fillTemplate(messages.sources.captured, { date: new Date(source.capturedAt).toLocaleDateString(intlLocale) })}
                </p>
              </div>
              <span className="rounded-full border border-ink/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-moss">
                {source.verificationStatus === "verified" ? messages.sources.verifiedSource : messages.sources.verificationPending}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/72">{source.excerpt}</p>
            <a href={source.url} className="mt-4 inline-flex text-sm font-medium text-clay underline-offset-4 hover:underline">
              {messages.sources.openSourceRecord}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
