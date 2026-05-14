import Link from "next/link";

import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import SessionActions from "@/components/auth/session-actions";
import { canManagePromises, canReviewModeration } from "@/lib/permissions";
import { isVerifiedAccount } from "@/modules/auth/identifiers";
import { getCurrentUser } from "@/modules/auth/session";
import { getLocalizedHref, getRequestLocalizationContext, getRequestMessages } from "@/modules/i18n/request";

export async function SiteHeader() {
    const user = await getCurrentUser();
    const messages = await getRequestMessages();
    const localization = await getRequestLocalizationContext();
    const homeHref = await getLocalizedHref("/");
    const adminPromiseHref = await getLocalizedHref("/admin/promises/new");
    const tenantLocalesHref = await getLocalizedHref("/admin/tenants/localization");
    const auditHref = await getLocalizedHref("/admin/audit");
    const moderationHref = await getLocalizedHref("/admin/moderation");
    const accountHref = await getLocalizedHref("/account");
    const signupHref = await getLocalizedHref("/signup");
    const loginHref = await getLocalizedHref("/login");
    const needsVerification = user && user.role !== "guest" && !isVerifiedAccount(user);

    return (
        <header className="relative z-40 border-b border-ink/10 bg-white/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
                <div className="flex items-center gap-4">
                    <Link href={homeHref} className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                        {messages.navigation.brand}
                    </Link>
                    <nav className="flex items-center gap-3 text-sm text-ink/70">
                        <Link href={homeHref} className="transition hover:text-ink">
                            {messages.navigation.home}
                        </Link>
                        {user && canManagePromises(user) ? (
                            <>
                                <Link href={adminPromiseHref} className="transition hover:text-ink">
                                    {messages.navigation.newPromise}
                                </Link>
                                <Link href={tenantLocalesHref} className="transition hover:text-ink">
                                    {messages.navigation.tenantLocales}
                                </Link>
                                <Link href={auditHref} className="transition hover:text-ink">
                                    {messages.navigation.audit}
                                </Link>
                            </>
                        ) : null}
                        {user && canReviewModeration(user) ? (
                            <Link href={moderationHref} className="transition hover:text-ink">
                                {messages.navigation.moderation}
                            </Link>
                        ) : null}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher
                        currentLocale={localization.locale}
                        supportedLocales={localization.supportedLocales}
                        label={messages.navigation.language}
                    />
                    {user ? (
                        <Link
                            href={accountHref}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${needsVerification
                                ? "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300"
                                : "border-ink/10 text-ink/70 hover:border-moss/30 hover:text-ink"}`}
                        >
                            <span>{messages.account.title}</span>
                            {needsVerification ? (
                                <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
                                    {messages.account.verifyCta}
                                </span>
                            ) : null}
                        </Link>
                    ) : null}
                    <SessionActions
                        isAuthenticated={Boolean(user)}
                        messages={messages.navigation}
                        hrefs={{
                            signup: signupHref,
                            login: loginHref,
                            signOutCallback: homeHref
                        }}
                    />
                </div>
            </div>
        </header>
    );
}