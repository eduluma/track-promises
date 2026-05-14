"use client";

import { useState, useTransition } from "react";

import type { AppMessages } from "@/modules/i18n/messages";

type VerifyEmailButtonProps = {
    messages: AppMessages["account"]["verifyEmailButton"];
};

type ChangePasswordFormProps = {
    messages: AppMessages["account"]["changePasswordForm"];
};

type AddPhoneFormProps = {
    messages: AppMessages["account"]["addPhoneForm"];
    initialPhone?: string | null;
    canDelete?: boolean;
};

type VerifyPhoneFormProps = {
    messages: AppMessages["account"]["verifyPhoneForm"];
};

type CommunityAttestationRequestFormProps = {
    messages: AppMessages["account"]["communityAttestationRequestForm"];
    defaultStatement?: string;
};

type CommunityAttestationWitnessFormProps = {
    reviewId: string;
    messages: AppMessages["account"]["communityAttestationWitnessForm"];
};

export function VerifyEmailButton({ messages }: VerifyEmailButtonProps) {
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    function handleClick() {
        startTransition(async () => {
            setStatus("sending");
            setErrorMessage(null);
            try {
                const res = await fetch("/api/auth/request-verification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ channel: "email" })
                });
                const data = (await res.json()) as { ok: boolean; error?: string };
                if (data.ok) {
                    setStatus("sent");
                } else {
                    setErrorMessage(data.error ?? messages.error);
                    setStatus("error");
                }
            } catch {
                setErrorMessage(messages.error);
                setStatus("error");
            }
        });
    }

    if (status === "sent") {
        return (
            <p className="rounded-xl bg-moss/10 px-4 py-3 text-sm text-moss">
                {messages.sent}
            </p>
        );
    }

    if (status === "error") {
        return (
            <p className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
                {errorMessage ?? messages.error}
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
            {status === "sending" ? messages.sending : messages.idle}
        </button>
    );
}

export function AddPhoneForm({ messages, initialPhone = null, canDelete = false }: AddPhoneFormProps) {
    const [phone, setPhone] = useState(initialPhone ?? "");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const hasExistingPhone = Boolean(initialPhone);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
            try {
                const response = await fetch("/api/account/phone", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone })
                });
                const data = (await response.json()) as { ok: boolean; error?: string };

                if (!data.ok) {
                    setError(data.error ?? messages.failed);
                    return;
                }

                const url = new URL(window.location.href);
                url.searchParams.set("phone", hasExistingPhone ? "updated" : "1");
                window.location.href = url.toString();
            } catch {
                setError(messages.failed);
            }
        });
    }

    function handleDelete() {
        setError(null);

        startDeleteTransition(async () => {
            try {
                const response = await fetch("/api/account/phone", { method: "DELETE" });
                const data = (await response.json()) as { ok: boolean; error?: string };

                if (!data.ok) {
                    setError(data.error ?? messages.deleteFailed);
                    return;
                }

                const url = new URL(window.location.href);
                url.searchParams.set("phone", "deleted");
                window.location.href = url.toString();
            } catch {
                setError(messages.deleteFailed);
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="accountPhone" className="block text-sm font-medium text-ink">
                    {messages.label}
                </label>
                <input
                    id="accountPhone"
                    name="accountPhone"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={messages.placeholder}
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
                />
            </div>
            {error ? <p className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={isPending || isDeleting}
                    className="rounded-xl bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-moss/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPending ? messages.saving : hasExistingPhone ? messages.update : messages.submit}
                </button>
                {hasExistingPhone && canDelete ? (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isPending || isDeleting}
                        className="rounded-xl border border-clay/20 px-4 py-2 text-sm font-medium text-clay transition hover:bg-clay/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDeleting ? messages.deleting : messages.delete}
                    </button>
                ) : null}
            </div>
        </form>
    );
}

export function CommunityAttestationRequestForm({ messages, defaultStatement }: CommunityAttestationRequestFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const form = event.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            try {
                const response = await fetch("/api/account/community-attestation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        city: String(formData.get("city") ?? ""),
                        locality: String(formData.get("locality") ?? ""),
                        postalCode: String(formData.get("postalCode") ?? ""),
                        address: String(formData.get("address") ?? ""),
                        statement: String(formData.get("statement") ?? "")
                    })
                });
                const data = (await response.json()) as { ok: boolean; error?: string };

                if (!data.ok) {
                    setError(data.error ?? messages.failed);
                    return;
                }

                const url = new URL(window.location.href);
                url.searchParams.set("attestation", "requested");
                window.location.href = url.toString();
            } catch {
                setError(messages.failed);
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="attestationCity" className="block text-sm font-medium text-ink">{messages.city}</label>
                <input id="attestationCity" name="city" type="text" required className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss" />
            </div>
            <div>
                <label htmlFor="attestationLocality" className="block text-sm font-medium text-ink">{messages.locality}</label>
                <input id="attestationLocality" name="locality" type="text" className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss" />
            </div>
            <div>
                <label htmlFor="attestationPostalCode" className="block text-sm font-medium text-ink">{messages.postalCode}</label>
                <input id="attestationPostalCode" name="postalCode" type="text" className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss" />
            </div>
            <div>
                <label htmlFor="attestationAddress" className="block text-sm font-medium text-ink">{messages.address}</label>
                <textarea id="attestationAddress" name="address" rows={3} className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss" />
            </div>
            <div>
                <label htmlFor="attestationStatement" className="block text-sm font-medium text-ink">{messages.statement}</label>
                <textarea id="attestationStatement" name="statement" rows={3} defaultValue={defaultStatement} className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss" />
            </div>
            {error ? <p className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
            <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-moss/85 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending ? messages.saving : messages.submit}
            </button>
        </form>
    );
}

export function CommunityAttestationWitnessForm({ reviewId, messages }: CommunityAttestationWitnessFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        const form = event.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            try {
                const response = await fetch(`/api/account/community-attestation/${reviewId}/witness`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        relationship: String(formData.get("relationship") ?? ""),
                        city: String(formData.get("city") ?? ""),
                        locality: String(formData.get("locality") ?? ""),
                        postalCode: String(formData.get("postalCode") ?? ""),
                        note: String(formData.get("note") ?? "")
                    })
                });
                const data = (await response.json()) as { ok: boolean; error?: string };

                if (!data.ok) {
                    setError(data.error ?? messages.failed);
                    return;
                }

                setSuccess(true);
                form.reset();
            } catch {
                setError(messages.failed);
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="witnessRelationship" className="block text-sm font-medium text-ink">{messages.relationship}</label>
                <input id="witnessRelationship" name="relationship" type="text" required className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss" />
            </div>
            <div>
                <label htmlFor="witnessCity" className="block text-sm font-medium text-ink">{messages.city}</label>
                <input id="witnessCity" name="city" type="text" required className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss" />
            </div>
            <div>
                <label htmlFor="witnessLocality" className="block text-sm font-medium text-ink">{messages.locality}</label>
                <input id="witnessLocality" name="locality" type="text" className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss" />
            </div>
            <div>
                <label htmlFor="witnessPostalCode" className="block text-sm font-medium text-ink">{messages.postalCode}</label>
                <input id="witnessPostalCode" name="postalCode" type="text" className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss" />
            </div>
            <div>
                <label htmlFor="witnessNote" className="block text-sm font-medium text-ink">{messages.note}</label>
                <textarea id="witnessNote" name="note" rows={3} className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss" />
            </div>
            {error ? <p className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
            {success ? <p className="rounded-xl bg-moss/10 px-4 py-3 text-sm text-moss">{messages.success}</p> : null}
            <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-moss/85 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending ? messages.submitting : messages.submit}
            </button>
        </form>
    );
}

export function VerifyPhoneForm({ messages }: VerifyPhoneFormProps) {
    const [requestState, setRequestState] = useState<"idle" | "sending" | "sent">("idle");
    const [isVerifying, startVerifyTransition] = useTransition();
    const [, startRequestTransition] = useTransition();
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [debugCode, setDebugCode] = useState<string | null>(null);

    function handleSendCode() {
        startRequestTransition(async () => {
            setError(null);
            setDebugCode(null);
            setRequestState("sending");

            try {
                const response = await fetch("/api/auth/request-verification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ channel: "phone" })
                });
                const data = (await response.json()) as
                    | { ok: true; delivery: "sms" | "debug"; debugCode?: string }
                    | { ok: false; error: string };

                if (!data.ok) {
                    setError(data.error);
                    setRequestState("idle");
                    return;
                }

                setDebugCode(data.delivery === "debug" ? data.debugCode ?? null : null);
                setRequestState("sent");
            } catch {
                setError(messages.sendError);
                setRequestState("idle");
            }
        });
    }

    function handleVerify(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        startVerifyTransition(async () => {
            try {
                const response = await fetch("/api/auth/verify-phone", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code })
                });
                const data = (await response.json()) as { ok: boolean; error?: string };

                if (!data.ok) {
                    setError(data.error ?? messages.verifyError);
                    return;
                }

                const url = new URL(window.location.href);
                url.searchParams.set("verified", "1");
                window.location.href = url.toString();
            } catch {
                setError(messages.verifyError);
            }
        });
    }

    return (
        <div className="space-y-3">
            {requestState !== "sent" ? (
                <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={requestState === "sending"}
                    className="rounded-xl bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-moss/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {requestState === "sending" ? messages.sending : messages.idle}
                </button>
            ) : (
                <p className="rounded-xl bg-moss/10 px-4 py-3 text-sm text-moss">
                    {messages.sent}
                </p>
            )}

            {debugCode ? (
                <p className="rounded-xl bg-ink/5 px-4 py-3 text-sm text-ink">
                    {messages.debugCodeLabel} <span className="font-semibold">{debugCode}</span>
                </p>
            ) : null}

            {requestState === "sent" ? (
                <form onSubmit={handleVerify} className="space-y-3">
                    <div>
                        <label htmlFor="phoneVerificationCode" className="block text-sm font-medium text-ink">
                            {messages.codeLabel}
                        </label>
                        <input
                            id="phoneVerificationCode"
                            name="phoneVerificationCode"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            minLength={6}
                            maxLength={6}
                            required
                            value={code}
                            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder={messages.codePlaceholder}
                            className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isVerifying}
                        className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isVerifying ? messages.verifying : messages.submit}
                    </button>
                </form>
            ) : null}

            {error ? (
                <p className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
                    {error}
                </p>
            ) : null}
        </div>
    );
}

export function ChangePasswordForm({ messages }: ChangePasswordFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        const form = event.currentTarget;
        const fd = new FormData(form);
        const currentPassword = String(fd.get("currentPassword") ?? "");
        const newPassword = String(fd.get("newPassword") ?? "");
        const confirmPassword = String(fd.get("confirmPassword") ?? "");

        if (newPassword !== confirmPassword) {
            setError(messages.mismatch);
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
                form.reset();
            } else {
                setError(data.error ?? messages.failed);
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-ink">
                    {messages.currentPassword}
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
                    {messages.newPassword}
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
                    {messages.confirmPassword}
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
                <p className="rounded-xl bg-moss/10 px-4 py-3 text-sm text-moss">{messages.success}</p>
            ) : null}
            <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending ? messages.saving : messages.submit}
            </button>
        </form>
    );
}
