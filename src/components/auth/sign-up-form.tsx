"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

import { type IdentifierType } from "@/modules/auth/identifiers";
import type { AppMessages } from "@/modules/i18n/messages";

const PLACEHOLDERS: Record<IdentifierType, string> = {
    email: "you@example.com",
    phone: "+91 98765 43210",
    aadhaar: "1234 5678 9012",
    pan: "ABCDE1234F"
};

const INPUT_TYPES: Record<IdentifierType, string> = {
    email: "email",
    phone: "tel",
    aadhaar: "text",
    pan: "text"
};

type SignUpFormProps = {
    redirectTo: string;
    accountHref: string;
    messages: AppMessages["auth"]["signUpForm"];
};

type SuccessState = {
    identifierType: IdentifierType;
    identifier: string;
    redirectTo: string;
};

export function SignUpForm({ redirectTo, accountHref, messages }: SignUpFormProps) {
    const [identifierType, setIdentifierType] = useState<IdentifierType>("email");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<SuccessState | null>(null);
    const [isPending, startTransition] = useTransition();

    const optionLabels = messages.identifierOptions;
    const hintLabels = messages.identifierHints;

    if (success) {
        const loginHref = `/login?redirectTo=${encodeURIComponent(success.redirectTo)}` as `/${string}`;
        return (
            <div className="mt-8 space-y-4 rounded-2xl border border-moss/20 bg-moss/5 p-6">
                <p className="text-base font-semibold text-moss">{messages.accountCreated}</p>
                <p className="text-sm leading-6 text-ink/75">
                    {success.identifierType === "email" ? messages.signedInLaterEmail : messages.signedInLaterOther}{" "}
                    <Link href={loginHref} className="font-medium text-moss underline-offset-2 hover:underline">
                        {messages.signInPage}
                    </Link>
                    {success.identifierType !== "email" ? <strong> {messages.chooseSignInType} {optionLabels[success.identifierType]}</strong> : null}
                </p>
                <div className="rounded-xl border border-ink/10 bg-white p-4 text-sm text-ink/80">
                    <p>
                        <span className="font-medium">{optionLabels[success.identifierType]}:</span> {success.identifier}
                    </p>
                    <p className="mt-1">
                        <span className="font-medium">{messages.passwordLabel}</span> {messages.chosenPassword}
                    </p>
                </div>
                {success.identifierType === "phone" ? (
                    <p className="text-xs text-ink/55">{messages.phoneVerificationNext}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-3">
                    {success.identifierType === "phone" ? (
                        <button
                            type="button"
                            onClick={() => { window.location.href = accountHref; }}
                            className="inline-flex rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-moss/85"
                        >
                            {messages.verifyNow}
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => { window.location.href = success.redirectTo; }}
                        className="inline-flex rounded-full border border-moss/20 bg-white px-5 py-2.5 text-sm font-semibold text-moss transition hover:border-moss/35 hover:bg-moss/5"
                    >
                        {messages.continue}
                    </button>
                </div>
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
                const password = String(formData.get("password") ?? "");

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
                        setError(messages.autoSignInFailed);
                        return;
                    }

                    // Show success state (with login instructions) before redirecting
                    setSuccess({ identifierType, identifier, redirectTo });
                });
            }}
        >
            <div>
                <label htmlFor="identifierType" className="text-sm font-medium text-ink">
                    {messages.identifierType}
                </label>
                <select
                    id="identifierType"
                    name="identifierType"
                    value={identifierType}
                    onChange={(e) => setIdentifierType(e.target.value as IdentifierType)}
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                >
                    <option value="email">{optionLabels.email}</option>
                    <option value="phone">{optionLabels.phone}</option>
                    <option value="aadhaar">{optionLabels.aadhaar}</option>
                    <option value="pan">{optionLabels.pan}</option>
                </select>
            </div>

            <div>
                <label htmlFor="identifier" className="text-sm font-medium text-ink">
                    {optionLabels[identifierType]}
                </label>
                <input
                    id="identifier"
                    key={identifierType}
                    name="identifier"
                    type={INPUT_TYPES[identifierType]}
                    required
                    autoComplete="off"
                    placeholder={PLACEHOLDERS[identifierType]}
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                />
                <p className="mt-1.5 text-xs text-ink/55">{hintLabels[identifierType]}</p>
            </div>

            <div>
                <label htmlFor="password" className="text-sm font-medium text-ink">
                    {messages.password}
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder={messages.passwordPlaceholder}
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                />
                <p className="mt-1.5 text-xs text-ink/55">{messages.passwordHint}</p>
            </div>

            <div>
                <label htmlFor="displayName" className="text-sm font-medium text-ink">
                    {messages.displayName} <span className="font-normal text-ink/50">({messages.optional})</span>
                </label>
                <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    placeholder={messages.displayNamePlaceholder}
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-moss px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-moss/40"
            >
                {isPending ? messages.creating : messages.submit}
            </button>

            {error ? <p className="text-sm font-medium text-[#b42318]">{error}</p> : null}
        </form>
    );
}
