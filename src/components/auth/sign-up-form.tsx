"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

type IdentifierType = "email" | "phone" | "aadhaar" | "pan";

const IDENTIFIER_CONFIG: Record<IdentifierType, { label: string; inputType: string; placeholder: string; hint: string }> = {
    email: {
        label: "Email address",
        inputType: "email",
        placeholder: "you@example.com",
        hint: "A verification link will be sent to this address."
    },
    phone: {
        label: "Mobile number",
        inputType: "tel",
        placeholder: "+91 98765 43210",
        hint: "An OTP will be sent via SMS."
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

export function SignUpForm({ redirectTo }: SignUpFormProps) {
    const [identifierType, setIdentifierType] = useState<IdentifierType>("email");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const config = IDENTIFIER_CONFIG[identifierType];

    return (
        <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                setError(null);

                const formData = new FormData(event.currentTarget);
                const identifier = String(formData.get("identifier") ?? "");
                const displayName = String(formData.get("displayName") ?? "").trim() || undefined;

                startTransition(async () => {
                    const response = await fetch("/api/auth/signup", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ identifierType, identifier, displayName })
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
                        setError("Account created but sign-in failed. Please sign in manually.");
                        return;
                    }

                    window.location.href = result.url ?? redirectTo;
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
