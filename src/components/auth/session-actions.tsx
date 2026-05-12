"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type SessionActionsProps = {
    isAuthenticated: boolean;
};

export default function SessionActions({ isAuthenticated }: SessionActionsProps) {
    if (!isAuthenticated) {
        return (
            <div className="flex items-center gap-2">
                <Link href="/signup" className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-moss/85">
                    Create account
                </Link>
                <Link href="/login" className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition hover:border-moss/40 hover:text-ink">
                    Sign in
                </Link>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition hover:border-clay/40 hover:text-ink"
        >
            Sign out
        </button>
    );
}