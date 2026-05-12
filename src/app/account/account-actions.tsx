"use client";

import { useState, useTransition } from "react";

export function VerifyEmailButton() {
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [, startTransition] = useTransition();

    function handleClick() {
        startTransition(async () => {
            setStatus("sending");
            try {
                const res = await fetch("/api/auth/request-verification", { method: "POST" });
                const data = (await res.json()) as { ok: boolean; error?: string };
                setStatus(data.ok ? "sent" : "error");
            } catch {
                setStatus("error");
            }
        });
    }

    if (status === "sent") {
        return (
            <p className="rounded-xl bg-moss/10 px-4 py-3 text-sm text-moss">
                Verification email sent — check your inbox and click the link.
            </p>
        );
    }

    if (status === "error") {
        return (
            <p className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
                Something went wrong. Please try again.
            </p>
        );
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={status === "sending"}
            className="rounded-xl bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-moss/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {status === "sending" ? "Sending…" : "Send verification email"}
        </button>
    );
}

export function ChangePasswordForm() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        const fd = new FormData(event.currentTarget);
        const currentPassword = String(fd.get("currentPassword") ?? "");
        const newPassword = String(fd.get("newPassword") ?? "");
        const confirmPassword = String(fd.get("confirmPassword") ?? "");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        startTransition(async () => {
            const res = await fetch("/api/account/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = (await res.json()) as { ok: boolean; error?: string };
            if (data.ok) {
                setSuccess(true);
                (event.target as HTMLFormElement).reset();
            } else {
                setError(data.error ?? "Failed to change password.");
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-ink">
                    Current password
                </label>
                <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
                />
            </div>
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-ink">
                    New password
                </label>
                <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
                />
            </div>
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink">
                    Confirm new password
                </label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
                />
            </div>
            {error ? <p className="text-sm font-medium text-clay">{error}</p> : null}
            {success ? (
                <p className="rounded-xl bg-moss/10 px-4 py-3 text-sm text-moss">Password changed successfully.</p>
            ) : null}
            <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending ? "Saving…" : "Change password"}
            </button>
        </form>
    );
}
