import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { getLocalizedHref } from "@/modules/i18n/request";
import { getRequestMessages } from "@/modules/i18n/request";
import { getCurrentUser } from "@/modules/auth/session";

type SignupPageProps = {
    searchParams: Promise<{ redirectTo?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
    const user = await getCurrentUser();
    const messages = await getRequestMessages();
    const { redirectTo = "/" } = await searchParams;
    const safeRedirectTo = redirectTo.startsWith("/") ? (redirectTo as `/${string}`) : "/";
    const localizedRedirectTo = await getLocalizedHref(safeRedirectTo);
    const accountHref = await getLocalizedHref("/account");
    const loginHref = await getLocalizedHref(
        `/login${localizedRedirectTo !== "/" ? `?redirectTo=${encodeURIComponent(localizedRedirectTo)}` : ""}`
    );

    if (user) {
        redirect(localizedRedirectTo);
    }

    return (
        <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col justify-center px-6 py-10 sm:px-10">
            <section className="grid gap-8 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">{messages.auth.signupEyebrow}</p>
                    <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-ink">{messages.auth.signupTitle}</h1>
                    <p className="mt-4 text-base leading-7 text-ink/72">
                        {messages.auth.signupSummary}
                    </p>

                    <div className="mt-6 space-y-3 text-sm text-ink/72">
                        <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                            <p className="font-medium text-ink">{messages.auth.afterRegistrationTitle}</p>
                            <p className="mt-1">{messages.auth.afterRegistrationBody}</p>
                        </div>
                        <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                            <p className="font-medium text-ink">{messages.auth.demoModeTitle}</p>
                            <p className="mt-1">{messages.auth.demoModeBody}</p>
                        </div>
                    </div>

                    <p className="mt-6 text-sm text-ink/60">
                        {messages.auth.alreadyHaveAccount}{" "}
                        <Link href={loginHref} className="font-medium text-moss underline-offset-2 hover:underline">
                            {messages.auth.signInLink}
                        </Link>
                    </p>
                </div>

                <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-6">
                    <h2 className="text-2xl font-semibold text-ink">{messages.auth.createAccountTitle}</h2>
                    <p className="mt-3 text-sm leading-6 text-ink/70">
                        {messages.auth.createAccountSummary}
                    </p>
                    <SignUpForm redirectTo={localizedRedirectTo} accountHref={accountHref} messages={messages.auth.signUpForm} />
                </section>
            </section>
        </main>
    );
}
