import Link from "next/link";

import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import SessionActions from "@/components/auth/session-actions";
import { canManagePromises, canManageTenantLocales, canReviewModeration, canViewAuditLogs } from "@/lib/permissions";
import { isVerifiedAccount } from "@/modules/auth/identifiers";
import { getCurrentUser } from "@/modules/auth/session";
import { getLocalizedHref, getRequestLocalizationContext, getRequestMessages } from "@/modules/i18n/request";

export async function SiteHeader() {
    const user = await getCurrentUser();
    const messages = await getRequestMessages();
    const localization = await getRequestLocalizationContext();
    const homeHref = await getLocalizedHref("/");
    const adminReportsHref = await getLocalizedHref("/admin");
    const adminPromiseHref = await getLocalizedHref("/admin/promises/new");
    const tenantLocalesHref = await getLocalizedHref("/admin/tenants/localization");
    const auditHref = await getLocalizedHref("/admin/audit");
    const moderationHref = await getLocalizedHref("/admin/moderation");
    const accountHref = await getLocalizedHref("/account");
    const signupHref = await getLocalizedHref("/signup");
    const loginHref = await getLocalizedHref("/login");
    const needsVerification = user && user.role !== "guest" && !isVerifiedAccount(user);
    const accountMenuItems = [
        user
            ? {
                href: accountHref,
                label: messages.account.title
            }
            : null,
        user?.role === "platform_admin"
            ? {
                href: adminReportsHref,
                label: messages.navigation.reports
            }
            : null,
        user && canManagePromises(user)
            ? {
                href: adminPromiseHref,
                label: messages.navigation.newPromise
            }
            : null,
        user && canReviewModeration(user)
            ? {
                href: moderationHref,
                label: messages.navigation.moderation
            }
            : null,
        user && canManageTenantLocales(user)
            ? {
                href: tenantLocalesHref,
                label: messages.navigation.tenantLocales
            }
            : null,
        user && canViewAuditLogs(user)
            ? {
                href: auditHref,
                label: messages.navigation.audit
            }
            : null
    ].filter((item): item is { href: typeof accountHref; label: string } => item !== null);

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
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher
                        currentLocale={localization.locale}
                        supportedLocales={localization.supportedLocales}
                        label={messages.navigation.language}
                    />
                    <SessionActions
                        isAuthenticated={Boolean(user)}
                        accountLabel={messages.account.title}
                        needsVerification={Boolean(needsVerification)}
                        verificationLabel={messages.account.verifyCta}
                        menuItems={accountMenuItems}
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