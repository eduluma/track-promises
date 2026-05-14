"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

import { normalizeIdentifierToEmail, type IdentifierType } from "@/modules/auth/identifiers";
import type { AppMessages } from "@/modules/i18n/messages";

const PLACEHOLDER: Record<IdentifierType, string> = {
    email: "you@example.com",
    phone: "+91 98765 43210",
    aadhaar: "1234 5678 9012",
    pan: "ABCDE1234F"
};

const LABEL: Record<IdentifierType, string> = {
    email: "Email",
    phone: "Mobile number",
    aadhaar: "Aadhaar number",
    pan: "PAN number"
};

type SignInFormProps = {
    redirectTo: string;
    messages: AppMessages["auth"]["signInForm"];
};

export function SignInForm({ redirectTo, messages }: SignInFormProps) {
    const [identifierType, setIdentifierType] = useState<IdentifierType>("email");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const isEmail = identifierType === "email";

    return (
        <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                setErrorMessage(null);

                const formData = new FormData(event.currentTarget);
                const rawIdentifier = String(formData.get("identifier") ?? "");
                const password = String(formData.get("password") ?? "");
                const email = normalizeIdentifierToEmail(identifierType, rawIdentifier);

                startTransition(async () => {
                    const result = await signIn("credentials", {
                        email,
                        password,
                        redirect: false,
                        callbackUrl: redirectTo
                    });

                    if (!result || result.error) {
                        setErrorMessage(messages.error);
                        return;
                    }

                    window.location.href = result.url ?? redirectTo;
                });
            }}
        >
            <div>
                <label htmlFor="identifierType" className="text-sm font-medium text-ink">
                    {messages.signInType}
                </label>
                <select
                    id="identifierType"
                    name="identifierType"
                    value={identifierType}
                    onChange={(e) => setIdentifierType(e.target.value as IdentifierType)}
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                >
                    <option value="email">{messages.emailAddress}</option>
                    <option value="phone">{messages.mobileNumber}</option>
                    <option value="aadhaar">{messages.aadhaarId}</option>
                    <option value="pan">{messages.panCard}</option>
                </select>
            </div>

            <div>
                <label htmlFor="identifier" className="text-sm font-medium text-ink">
                    {LABEL[identifierType]}
                </label>
                <input
                    id="identifier"
                    key={identifierType}
                    name="identifier"
                    type={isEmail ? "email" : "text"}
                    required
                    autoComplete={isEmail ? "email" : "off"}
                    placeholder={PLACEHOLDER[identifierType]}
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                />
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
                    autoComplete="current-password"
                    placeholder={messages.passwordPlaceholder}
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-moss px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-moss/40"
            >
                {isPending ? messages.submitting : messages.submit}
            </button>
            {errorMessage ? <p className="text-sm font-medium text-[#b42318]">{errorMessage}</p> : null}
        </form>
    );
}
