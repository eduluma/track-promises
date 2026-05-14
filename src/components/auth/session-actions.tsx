"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

import type { LocalizedHref } from "@/modules/i18n/config";

type SessionActionsProps = {
    isAuthenticated: boolean;
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

export default function SessionActions({ isAuthenticated, messages, hrefs }: SessionActionsProps) {
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
        <button
            type="button"
            onClick={() => signOut({ callbackUrl: hrefs.signOutCallback })}
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition hover:border-clay/40 hover:text-ink"
        >
            <SignOutIcon />
            {messages.signOut}
        </button>
    );
}