"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { localeMetadata, type SupportedLocale } from "@/modules/i18n/config";
import { localizeAppHref } from "@/modules/i18n/public-content-routes";

type LanguageSwitcherProps = {
    currentLocale: SupportedLocale;
    supportedLocales: readonly SupportedLocale[];
    label: string;
};

function LanguageTriggerIcon() {
    return (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sand/80 text-ink/70">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                <circle cx="12" cy="12" r="8" />
                <path d="M4 12h16" />
                <path d="M12 4a12 12 0 0 1 0 16" />
                <path d="M12 4a12 12 0 0 0 0 16" />
            </svg>
        </span>
    );
}

function LanguageItemIcon() {
    return (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sand/80 text-ink/70">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                <circle cx="12" cy="12" r="8" />
                <path d="M4 12h16" />
                <path d="M12 4a12 12 0 0 1 0 16" />
                <path d="M12 4a12 12 0 0 0 0 16" />
            </svg>
        </span>
    );
}

export function LanguageSwitcher({ currentLocale, supportedLocales, label }: LanguageSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();
    const currentHref = `${pathname}${queryString ? `?${queryString}` : ""}`;

    useEffect(() => {
        setIsOpen(false);
    }, [pathname, queryString]);

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    function handleSelect() {
        setIsOpen(false);
    }

    return (
        <div ref={containerRef} className="relative z-50 isolate">
            <button
                type="button"
                aria-label={`Language: ${localeMetadata[currentLocale].label}`}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                onClick={() => setIsOpen((open) => !open)}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-3 py-2 text-sm font-medium text-ink/75 transition hover:border-moss/35 hover:text-ink"
            >
                <LanguageTriggerIcon />
                <span className="hidden sm:inline text-ink/55">Language</span>
                <span className="font-medium text-ink">{localeMetadata[currentLocale].label}</span>
                <span className={`text-xs text-ink/45 transition ${isOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {isOpen ? (
                <div className="absolute right-0 z-[60] mt-2 min-w-52 overflow-hidden rounded-2xl border border-ink/10 bg-white/95 shadow-card backdrop-blur">
                    <ul className="py-2" role="menu" aria-label={label}>
                        {supportedLocales.map((locale) => {
                            const metadata = localeMetadata[locale];
                            const href = localizeAppHref(currentHref, locale);
                            const isActive = locale === currentLocale;

                            return (
                                <li key={locale}>
                                    <a
                                        href={href}
                                        role="menuitemradio"
                                        aria-checked={isActive}
                                        onClick={handleSelect}
                                        className={`flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-sand/60 ${isActive ? "bg-sand/70 text-ink" : "text-ink/72"}`}
                                        lang={locale}
                                        hrefLang={locale}
                                    >
                                        <span className="flex items-center gap-3">
                                            <LanguageItemIcon />
                                            <span className="font-medium">{metadata.nativeLabel}</span>
                                        </span>
                                        <span className="text-xs uppercase tracking-[0.18em] text-ink/45">{metadata.label}</span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}