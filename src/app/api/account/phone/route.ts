import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/modules/auth/options";
import { getSyntheticIdentifierType, normalizeIdentifierToEmail, normalizePhoneNumber } from "@/modules/auth/identifiers";
import {
    getPersistedUserByEmail,
    getPersistedUserById,
    getPersistedUserByPhone,
    removePersistedUserPhone,
    updatePersistedUserPhone
} from "@/modules/auth/user-store";

const schema = z.object({
    phone: z.string().min(1, "Enter a mobile number.").max(40)
});

function getStateAfterPhoneReset(user: { state: "unverified" | "verified" | "readonly" | "suspended" | "moderator_approved"; emailVerified: boolean }) {
    if (user.state === "readonly" || user.state === "suspended" || user.state === "moderator_approved") {
        return user.state;
    }

    return user.emailVerified ? "verified" : "unverified";
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
    }

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input." }, { status: 400 });
    }

    let phone: string;

    try {
        phone = normalizePhoneNumber(parsed.data.phone);
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: err instanceof Error ? err.message : "Invalid mobile number." },
            { status: 400 }
        );
    }

    const currentUser = await getPersistedUserById(session.user.id);

    if (!currentUser) {
        return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    }

    if (currentUser.phone === phone) {
        return NextResponse.json({ ok: true, phone });
    }

    const existingOwner = await getPersistedUserByPhone(phone);
    const syntheticIdentifierType = getSyntheticIdentifierType(currentUser.email);
    const nextSyntheticEmail = syntheticIdentifierType === "phone" ? normalizeIdentifierToEmail("phone", phone) : null;

    if (existingOwner && existingOwner.id !== currentUser.id) {
        return NextResponse.json({ ok: false, error: "That mobile number is already linked to another account." }, { status: 409 });
    }

    if (nextSyntheticEmail) {
        const existingEmailOwner = await getPersistedUserByEmail(nextSyntheticEmail);

        if (existingEmailOwner && existingEmailOwner.id !== currentUser.id) {
            return NextResponse.json({ ok: false, error: "That mobile number is already linked to another account." }, { status: 409 });
        }
    }

    try {
        const updated = await updatePersistedUserPhone({
            id: currentUser.id,
            phone,
            email: nextSyntheticEmail ?? undefined,
            state: getStateAfterPhoneReset(currentUser)
        });

        if (!updated) {
            return NextResponse.json({ ok: false, error: "We could not save that mobile number right now." }, { status: 500 });
        }
    } catch (err) {
        console.error("[account-phone] update failed:", err);
        return NextResponse.json({ ok: false, error: "We could not save that mobile number right now." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, phone });
}

export async function DELETE() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
    }

    const currentUser = await getPersistedUserById(session.user.id);

    if (!currentUser) {
        return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    }

    if (!currentUser.phone) {
        return NextResponse.json({ ok: false, error: "No mobile number is saved on this account." }, { status: 400 });
    }

    if (getSyntheticIdentifierType(currentUser.email) === "phone") {
        return NextResponse.json(
            { ok: false, error: "Add another sign-in identifier before removing your mobile number." },
            { status: 400 }
        );
    }

    try {
        const updated = await removePersistedUserPhone({
            id: currentUser.id,
            state: getStateAfterPhoneReset(currentUser)
        });

        if (!updated) {
            return NextResponse.json({ ok: false, error: "We could not remove that mobile number right now." }, { status: 500 });
        }
    } catch (err) {
        console.error("[account-phone] delete failed:", err);
        return NextResponse.json({ ok: false, error: "We could not remove that mobile number right now." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}

