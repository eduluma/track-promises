"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

type SignInFormProps = {
    redirectTo: string;
};

export function SignInForm({ redirectTo }: SignInFormProps) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    return (
        <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                setErrorMessage(null);

                const formData = new FormData(event.currentTarget);
                const email = String(formData.get("email") ?? "");
                const password = String(formData.get("password") ?? "");

                startTransition(async () => {
                    const result = await signIn("credentials", {
                        email,
                        password,
                        redirect: false,
                        callbackUrl: redirectTo
                    });

                    if (!result || result.error) {
                        setErrorMessage("Sign-in failed. Use one of the seeded demo accounts below.");
                        return;
                    }

                    window.location.href = result.url ?? redirectTo;
                });
            }}
        >
            <div>
                <label htmlFor="email" className="text-sm font-medium text-ink">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue="demo@track-promises.local"
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                />
            </div>
            <div>
                <label htmlFor="password" className="text-sm font-medium text-ink">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    defaultValue="demo-password"
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                />
            </div>
            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-moss px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-moss/40"
            >
                {isPending ? "Signing in..." : "Sign in"}
            </button>
            {errorMessage ? <p className="text-sm font-medium text-[#b42318]">{errorMessage}</p> : null}
        </form>
    );
}