"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import type { LocalizedHref } from "@/modules/i18n/config";
import type { AppMessages } from "@/modules/i18n/messages";

type ResetPasswordFormProps = {
    token: string | null;
    loginHref: LocalizedHref;
    requestMessages: AppMessages["auth"]["resetPasswordRequestForm"];
    completeMessages: AppMessages["auth"]["resetPasswordCompleteForm"];
    backToSignInLabel: string;
};

export function ResetPasswordForm({
    token,
    loginHref,
    requestMessages,
    completeMessages,
    backToSignInLabel
}: ResetPasswordFormProps) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (!token) {
        return (
            <form
                className="mt-8 space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    setErrorMessage(null);
                    setSuccessMessage(null);

                    const form = event.currentTarget;
                    const formData = new FormData(form);
                    const email = String(formData.get("email") ?? "").trim();

                    startTransition(async () => {
                        const response = await fetch("/api/auth/request-password-reset", {
                            method: "POST",
                            headers: {
                                "content-type": "application/json"
                            },
                            body: JSON.stringify({ email })
                        });

                        const payload = await response.json();

                        if (!response.ok) {
                            setErrorMessage(payload.error ?? requestMessages.failed);
                            return;
                        }

                        setSuccessMessage(requestMessages.success);
                        form.reset();
                    });
                }}
            >
                <div>
                    <label htmlFor="reset-email" className="text-sm font-medium text-ink">
                        {requestMessages.email}
                    </label>
                    <input
                        id="reset-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder={requestMessages.emailPlaceholder}
                        className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded-2xl bg-moss px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-moss/40"
                >
                    {isPending ? requestMessages.submitting : requestMessages.submit}
                </button>
                {successMessage ? <p className="rounded-xl bg-moss/10 px-4 py-3 text-sm text-moss">{successMessage}</p> : null}
                {errorMessage ? <p className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{errorMessage}</p> : null}
                <p className="text-center text-sm text-ink/60">
                    <Link href={loginHref} className="font-medium text-moss underline-offset-2 hover:underline">
                        {backToSignInLabel}
                    </Link>
                </p>
            </form>
        );
    }

    return (
        <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                setErrorMessage(null);
                setSuccessMessage(null);

                const form = event.currentTarget;
                const formData = new FormData(form);
                const newPassword = String(formData.get("newPassword") ?? "");
                const confirmPassword = String(formData.get("confirmPassword") ?? "");

                if (newPassword !== confirmPassword) {
                    setErrorMessage(completeMessages.mismatch);
                    return;
                }

                startTransition(async () => {
                    const response = await fetch("/api/auth/reset-password", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json"
                        },
                        body: JSON.stringify({ token, newPassword })
                    });

                    const payload = await response.json();

                    if (!response.ok) {
                        setErrorMessage(payload.error ?? completeMessages.failed);
                        return;
                    }

                    setSuccessMessage(completeMessages.success);
                    form.reset();
                });
            }}
        >
            <div>
                <label htmlFor="newPassword" className="text-sm font-medium text-ink">
                    {completeMessages.newPassword}
                </label>
                <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                />
            </div>
            <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-ink">
                    {completeMessages.confirmPassword}
                </label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
                />
            </div>
            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-moss px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-moss/40"
            >
                {isPending ? completeMessages.submitting : completeMessages.submit}
            </button>
            {successMessage ? (
                <div className="rounded-xl bg-moss/10 px-4 py-3 text-sm text-moss">
                    <p>{successMessage}</p>
                    <p className="mt-2">
                        <Link href={loginHref} className="font-medium underline-offset-2 hover:underline">
                            {backToSignInLabel}
                        </Link>
                    </p>
                </div>
            ) : null}
            {errorMessage ? <p className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{errorMessage}</p> : null}
        </form>
    );
}