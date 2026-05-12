"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

type IdentifierType = "email" | "phone" | "aadhaar" | "pan";

const IDENTIFIER_CONFIG: Record<IdentifierType, { label: string; inputType: string; placeholder: string; hint: string }> = {
    email: {
        label: "Email address",
        inputType: "email",
        placeholder: "you@example.com",
        hint: "You'll use this email and the password you choose to sign in."
    },
    phone: {
        label: "Mobile number",
        inputType: "tel",
        placeholder: "+91 98765 43210",
        hint: "An OTP will be sent via SMS when that feature is enabled."
    },
    aadhaar: {
        label: "Aadhaar number",
        inputType: "text",
        placeholder: "1234 5678 9012",
        hint: "12-digit Aadhaar issued by UIDAI."
    },
    pan: {
        label: "PAN number",
        inputType: "text",
        placeholder: "ABCDE1234F",
        hint: "10-character Permanent Account Number."
    }
};

type SignUpFormProps = {
    redirectTo: string;
};

type SuccessState = {
    identifierType: IdentifierType;
    identifier: string;
    redirectTo: string;
};

export function SignUpForm({ redirectTo }: SignUpFormProps) {
    const [identifierType, setIdentifierType] = useState<IdentifierType>("email");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<SuccessState | null>(null);
    const [isPending, startTransition] = useTransition();

    const config = IDENTIFIER_CONFIG[identifierType];

    if (success) {
        const loginHref = `/login?redirectTo=${encodeURIComponent(success.redirectTo)}` as `/${string}`;
        return (
            <div className="mt-8 space-y-4 rounded-2xl border border-moss/20 bg-moss/5 p-6">
                <p className="text-base font-semibold text-moss">Account created!</p>
                {success.identifierType === "email" ? (
                    <>
                        <p className="text-sm leading-6 text-ink/75">
                            You&apos;re now signed in. To sign back in later, go to the{" "}
                            <Link href={loginHref} className="font-medium text-moss underline-offset-2 hover:underline">
                                sign-in page
                            </Link>{" "}
                            and use:
                        </p>
                        <div className="rounded-xl border border-ink/10 bg-white p-4 text-sm text-ink/80">
                            <p>
                                <span className="font-medium">Email:</span> {success.identifier}
                            </p>
                            <p className="mt-1">
                                <span className="font-medium">Password:</span> the one you just chose
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-sm leading-6 text-ink/75">
                            You&apos;re now signed in. To sign back in later, go to the{" "}
                            <Link href={loginHref} className="font-medium text-moss underline-offset-2 hover:underline">
                                sign-in page
                            </Link>
                            , choose <strong>{success.identifierType}</strong> as the sign-in type, and enter your number again.
                        </p>
                        <p className="text-xs text-ink/50">
                            OTP delivery is coming soon. Until then the sign-in page accepts your identifier without a password.
                        </p>
                    </>
                )}
                <Link
                    href={success.redirectTo as `/${string}`}
                    className="mt-2 inline-flex rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-moss/85"
                >
                    Continue
                </Link>
            </div>
        );
    }

    return (
        <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                setError(null);

                const formData = new FormData(event.currentTarget);
                const identifier = String(formData.get("identifier") ?? "");
                const displayName = String(formData.get("displayName") ?? "").trim() || undefined;
                const password = identifierType === "email" ? String(formData.get("password") ?? "") : undefined;

                startTransition(async () => {
                    const response = await fetch("/api/auth/signup", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ identifierType, identifier, displayName, password })
                    });

                    const data = (await response.json()) as
                        | { ok: true; credentials: { email: string; password: string } }
                        | { ok: false; error: string };

                    if (!data.ok) {
                        setError(data.error);
                        return;
                    }

                    const result = await signIn("credentials", {
                        email: data.credentials.email,
                        password: data.credentials.password,
                        redirect: false,
                        callbackUrl: redirectTo
                    });

                    if (!result || result.error) {
                        setError("Account created but auto sign-in failed. Please use the sign-in page.");
                        return;
                    }

                    // Show success state (with login instructions) before redirecting
                    setSuccess({ identifierType, identifier, redirectTo });
                });
            }}
        >
            <div>
                <label htmlFor="identifierType" className="text-sm font-medium text-ink">
                    Identifier type
                </label>
                <select
                    id="identifierType"
                    name="identifierType"
                    value={identifierType}
                    onChange={(e) => setIdentifierType(e.target.value as IdentifierType)}
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                >
                    <option value="email">Email address</option>
                    <option value="phone">Mobile number (OTP)</option>
                    <option value="aadhaar">Aadhaar ID</option>
                    <option value="pan">PAN card</option>
                </select>
            </div>

            <div>
                <label htmlFor="identifier" className="text-sm font-medium text-ink">
                    {config.label}
                </label>
                <input
                    id="identifier"
                    key={identifierType}
                    name="identifier"
                    type={config.inputType}
                    required
                    autoComplete="off"
                    placeholder={config.placeholder}
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                />
                <p className="mt-1.5 text-xs text-ink/55">{config.hint}</p>
            </div>

            <div>
                <label htmlFor="displayName" className="text-sm font-medium text-ink">
                    Display name <span className="font-normal text-ink/50">(optional)</span>
                </label>
                <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    placeholder="How you'll appear on the site"
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                />
            </div>

            {identifierType === "email" && (
                <div>
                    <label htmlFor="password" className="text-sm font-medium text-ink">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                    />
                    <p className="mt-1.5 text-xs text-ink/55">You&apos;ll use this to sign back in.</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-moss px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-moss/40"
            >
                {isPending ? "Creating account…" : "Create account"}
            </button>

            {error ? <p className="text-sm font-medium text-[#b42318]">{error}</p> : null}
        </form>
    );
}
