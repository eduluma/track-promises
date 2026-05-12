import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { demoUsers } from "@/modules/auth/demo-users";
import { getCurrentUser } from "@/modules/auth/session";

type LoginPageProps = {
    searchParams: Promise<{ redirectTo?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">Authentication</p>
                    <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-ink">Sign in with a seeded demo account</h1>
                    <p className="mt-4 text-base leading-7 text-ink/72">
                        Phase 1 uses Auth.js with a local credentials provider so voting, permissions, and admin flows all run through a real session.
                    </p>
                    <div className="mt-6 space-y-3 text-sm text-ink/72">
                        {demoUsers.map((account) => (
                            <div key={account.id} className="rounded-2xl border border-ink/10 bg-sand/70 p-4">
                                <p className="font-medium text-ink">{account.displayName}</p>
                                <p>{account.email}</p>
                                <p>Password: {account.password}</p>
                                <p className="capitalize">Role: {account.role.replaceAll("_", " ")}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <section className="rounded-[1.5rem] border border-ink/10 bg-sand/70 p-6">
                    <h2 className="text-2xl font-semibold text-ink">Credentials sign-in</h2>
                    <p className="mt-3 text-sm leading-6 text-ink/70">Use the seeded accounts to test verified, limited, editor, moderator, and platform-admin flows.</p>
                    <SignInForm redirectTo={safeRedirectTo} />
                    <p className="mt-4 text-center text-sm text-ink/60">
                        New here?{" "}
                        <Link href={`/signup${safeRedirectTo !== "/" ? `?redirectTo=${encodeURIComponent(safeRedirectTo)}` : ""}`} className="font-medium text-moss underline-offset-2 hover:underline">
                            Create an account
                        </Link>
                    </p>
                </section>
            </section>
        </main>
    );
}