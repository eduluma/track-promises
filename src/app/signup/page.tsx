import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { getCurrentUser } from "@/modules/auth/session";

type SignupPageProps = {
    searchParams: Promise<{ redirectTo?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
    const user = await getCurrentUser();
    const { redirectTo = "/" } = await searchParams;
    const safeRedirectTo = redirectTo.startsWith("/") ? (redirectTo as `/${string}`) : "/";

    if (user) {
        redirect(safeRedirectTo);
    }

    return (
        <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col justify-center px-6 py-10 sm:px-10">
            <section className="grid gap-8 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">Create account</p>
                    <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-ink">Just one piece of information</h1>
                    <p className="mt-4 text-base leading-7 text-ink/72">
                        Register with your email, phone number, Aadhaar ID, or PAN card. No password required for OTP-based methods.
                    </p>

                    <div className="mt-6 space-y-3 text-sm text-ink/72">
                        <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                            <p className="font-medium text-ink">After registration</p>
                            <p className="mt-1">Your account starts as <span className="font-medium">unverified</span>. Once we confirm your identifier, you can vote on promises.</p>
                        </div>
                        <div className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                            <p className="font-medium text-ink">Demo mode</p>
                            <p className="mt-1">OTP delivery and email verification are not yet wired. Your account is created and you are signed in immediately for testing.</p>
                        </div>
                    </div>

                    <p className="mt-6 text-sm text-ink/60">
                        Already have an account?{" "}
                        <Link href={`/login${redirectTo !== "/" ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`} className="font-medium text-moss underline-offset-2 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-6">
                    <h2 className="text-2xl font-semibold text-ink">Create your account</h2>
                    <p className="mt-3 text-sm leading-6 text-ink/70">
                        Choose how you want to identify yourself. Aadhaar and PAN options will be verified with government records in a future release.
                    </p>
                    <SignUpForm redirectTo={safeRedirectTo} />
                </section>
            </section>
        </main>
    );
}
