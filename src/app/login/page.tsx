import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { demoUsers } from "@/modules/auth/demo-users";
import { getLocalizedHref } from "@/modules/i18n/request";
import { getRequestMessages } from "@/modules/i18n/request";
import { getCurrentUser } from "@/modules/auth/session";

type LoginPageProps = {
    searchParams: Promise<{ redirectTo?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const user = await getCurrentUser();
    const messages = await getRequestMessages();
    const showDemoAccounts = process.env.TRACK_PROMISES_SHOW_DEMO_ACCOUNTS === "true";
    const { redirectTo = "/" } = await searchParams;
    const safeRedirectTo = redirectTo.startsWith("/") ? (redirectTo as `/${string}`) : "/";
    const localizedRedirectTo = await getLocalizedHref(safeRedirectTo);
    const signupHref = await getLocalizedHref(
        `/signup${localizedRedirectTo !== "/" ? `?redirectTo=${encodeURIComponent(localizedRedirectTo)}` : ""}`
    );
    const resetPasswordHref = await getLocalizedHref("/reset-password");

    if (user) {
        redirect(localizedRedirectTo);
    }

    return (
        <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col justify-center px-6 py-10 sm:px-10">
            <section className="grid gap-8 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">{messages.auth.loginEyebrow}</p>
                    <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-ink">{messages.auth.loginTitle}</h1>
                    <p className="mt-4 text-base leading-7 text-ink/72">
                        {messages.auth.loginSummary}
                    </p>
                    {showDemoAccounts ? (
                        <div className="mt-6 space-y-3 text-sm text-ink/72">
                            {demoUsers.map((account) => (
                                <div key={account.id} className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                                    <p className="font-medium text-ink">{account.displayName}</p>
                                    <p>{account.email}</p>
                                    <p>{messages.auth.demoPasswordLabel}: {account.password}</p>
                                    <p className="capitalize">{messages.auth.demoRoleLabel}: {messages.account.roleLabels[account.role] ?? account.role.replaceAll("_", " ")}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
                <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-6">
                    <h2 className="text-2xl font-semibold text-ink">{messages.auth.credentialsTitle}</h2>
                    <p className="mt-3 text-sm leading-6 text-ink/70">{messages.auth.credentialsSummary}</p>
                    <SignInForm redirectTo={localizedRedirectTo} messages={messages.auth.signInForm} />
                    <p className="mt-4 text-center text-sm text-ink/60">
                        <Link href={resetPasswordHref} className="font-medium text-moss underline-offset-2 hover:underline">
                            {messages.auth.resetPasswordLink}
                        </Link>
                    </p>
                    <p className="mt-4 text-center text-sm text-ink/60">
                        {messages.auth.newHere}{" "}
                        <Link href={signupHref} className="font-medium text-moss underline-offset-2 hover:underline">
                            {messages.auth.createAccountLink}
                        </Link>
                    </p>
                </section>
            </section>
        </main>
    );
}