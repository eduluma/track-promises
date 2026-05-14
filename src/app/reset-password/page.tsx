import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getLocalizedHref, getRequestMessages } from "@/modules/i18n/request";

type ResetPasswordPageProps = {
    searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const messages = await getRequestMessages();
    const loginHref = await getLocalizedHref("/login");
    const { token } = await searchParams;

    return (
        <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col justify-center px-6 py-10 sm:px-10">
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">{messages.auth.loginEyebrow}</p>
                <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-ink">{messages.auth.resetPasswordTitle}</h1>
                <p className="mt-4 text-base leading-7 text-ink/72">{messages.auth.resetPasswordSummary}</p>
                <p className="mt-3 rounded-2xl border border-ink/10 bg-sand/70 px-4 py-3 text-sm text-ink/72">
                    {messages.auth.resetPasswordEmailOnly}
                </p>
                <ResetPasswordForm
                    token={token ?? null}
                    loginHref={loginHref}
                    requestMessages={messages.auth.resetPasswordRequestForm}
                    completeMessages={messages.auth.resetPasswordCompleteForm}
                    backToSignInLabel={messages.auth.backToSignIn}
                />
                {!token ? null : (
                    <p className="mt-4 text-center text-sm text-ink/60">
                        <Link href={loginHref} className="font-medium text-moss underline-offset-2 hover:underline">
                            {messages.auth.backToSignIn}
                        </Link>
                    </p>
                )}
            </section>
        </main>
    );
}