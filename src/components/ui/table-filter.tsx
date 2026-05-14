import Link from "next/link";
import type { Route } from "next";

type TableFilterProps = {
    label: string;
    allLabel?: string;
    queryKey: string;
    currentValue: string | null;
    options: string[];
    pathname: string;
    searchParams: Record<string, string | undefined>;
};

export function TableFilter({ label, allLabel = "All", queryKey, currentValue, options, pathname, searchParams }: TableFilterProps) {
    const buildHref = (value: string | null): Route => {
        const params = new URLSearchParams();

        Object.entries(searchParams).forEach(([key, paramValue]) => {
            if (paramValue && key !== queryKey) {
                params.set(key, paramValue);
            }
        });

        if (value) {
            params.set(queryKey, value);
        }

        const query = params.toString();
        return (query.length > 0 ? `${pathname}?${query}` : pathname) as Route;
    };

    return (
        <div className="rounded-[1.25rem] border border-ink/10 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">{label}</p>
            <div className="mt-3 flex flex-wrap gap-2">
                <Link
                    href={buildHref(null)}
                    className={`rounded-full px-3 py-1 text-sm transition ${currentValue === null ? "bg-moss text-white" : "border border-ink/10 text-ink/70 hover:border-moss/30"
                        }`}
                >
                    {allLabel}
                </Link>
                {options.map((option) => (
                    <Link
                        key={option}
                        href={buildHref(option)}
                        className={`rounded-full px-3 py-1 text-sm transition ${currentValue === option ? "bg-moss text-white" : "border border-ink/10 text-ink/70 hover:border-moss/30"
                            }`}
                    >
                        {option}
                    </Link>
                ))}
            </div>
        </div>
    );
}