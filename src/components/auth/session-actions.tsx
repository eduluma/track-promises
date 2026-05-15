"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import type { LocalizedHref } from "@/modules/i18n/config";

type SessionActionsProps = {
    isAuthenticated: boolean;
    accountLabel?: string;
    needsVerification?: boolean;
    verificationLabel?: string;
    menuItems?: Array<{
        href: LocalizedHref;
        label: string;
    }>;
    messages: {
        createAccount: string;
        signIn: string;
        signOut: string;
    };
    hrefs: {
        signup: LocalizedHref;
        login: LocalizedHref;
        signOutCallback: LocalizedHref;
    };
};

function MenuChevronIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CreateAccountIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
            <path d="M5 20a7 7 0 0 1 14 0" />
            <path d="M19 8h4" />
            <path d="M21 6v4" />
        </svg>
    );
}

function SignInIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
            <path d="M14 7h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3" />
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
        </svg>
    );
}

function SignOutIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
            <path d="M10 7H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3" />
            <path d="M14 17l5-5-5-5" />
            <path d="M19 12H9" />
        </svg>
    );
}

export default function SessionActions({
    isAuthenticated,
    accountLabel,
    needsVerification = false,
    verificationLabel,
    menuItems = [],
    messages,
    hrefs
}: SessionActionsProps) {
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    if (!isAuthenticated) {
        return (
            <div className="flex items-center gap-2">
                <Link href={hrefs.signup} className="inline-flex items-center gap-2 rounded-full bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-moss/85">
                    <CreateAccountIcon />
                    {messages.createAccount}
                </Link>
                <Link href={hrefs.login} className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition hover:border-moss/40 hover:text-ink">
                    <SignInIcon />
                    {messages.signIn}
                </Link>
            </div>
        );
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-3 py-2 text-sm font-medium text-ink/70 transition hover:border-moss/30 hover:text-ink"
            >
                <span>{accountLabel}</span>
                {needsVerification && verificationLabel ? (
                    <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
                        {verificationLabel}
                    </span>
                ) : null}
                <span className={`transition ${isOpen ? "rotate-180" : ""}`}>
                    <MenuChevronIcon />
                </span>
            </button>
            {isOpen ? (
                <div className="absolute right-0 top-full mt-2 min-w-60 rounded-2xl border border-ink/10 bg-white p-2 shadow-lg shadow-ink/10">
                    <div className="flex flex-col gap-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl px-3 py-2 text-sm text-ink/75 transition hover:bg-sand/60 hover:text-ink"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <div className="mt-2 border-t border-ink/10 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                void signOut({ callbackUrl: hrefs.signOutCallback });
                            }}
                            className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-sand/60 hover:text-ink"
                        >
                            <SignOutIcon />
                            {messages.signOut}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}