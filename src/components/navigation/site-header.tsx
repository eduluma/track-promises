import Link from "next/link";

import SessionActions from "@/components/auth/session-actions";
import { canManagePromises, canReviewModeration } from "@/lib/permissions";
import { getCurrentUser } from "@/modules/auth/session";

export async function SiteHeader() {
    const user = await getCurrentUser();

    return (
        <header className="border-b border-ink/10 bg-white/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                        Track Promises
                    </Link>
                    <nav className="flex items-center gap-3 text-sm text-ink/70">
                        <Link href="/" className="transition hover:text-ink">
                            Home
                        </Link>
                        {user && canManagePromises(user) ? (
                            <>
                                <Link href="/admin/promises/new" className="transition hover:text-ink">
                                    New promise
                                </Link>
                                <Link href="/admin/audit" className="transition hover:text-ink">
                                    Audit
                                </Link>
                            </>
                        ) : null}
                        {user && canReviewModeration(user) ? (
                            <Link href="/admin/moderation" className="transition hover:text-ink">
                                Moderation
                            </Link>
                        ) : null}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    {user ? (
                        <Link href="/account" className="hidden text-sm text-ink/65 transition hover:text-ink sm:block">
                            {user.name} · {user.role}
                        </Link>
                    ) : null}
                    <SessionActions isAuthenticated={Boolean(user)} />
                </div>
            </div>
        </header>
    );
}