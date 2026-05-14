import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const PHONE_VERIFICATION_COOKIE = "__tp_phone_verification";

function sign(payload: string): string {
    const secret = process.env.NEXTAUTH_SECRET ?? "dev-secret";
    return createHmac("sha256", secret).update(`phone-verification:${payload}`).digest("hex");
}

export function createPhoneVerificationCode(): string {
    return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function createPhoneVerificationToken(userId: string, phone: string, code: string): string {
    const payload = Buffer.from(
        JSON.stringify({
            userId,
            phone,
            code,
            expiresAt: Date.now() + 10 * 60 * 1000
        })
    ).toString("base64url");

    return `${sign(payload)}.${payload}`;
}

export function consumePhoneVerificationToken(token: string): { userId: string; phone: string; code: string } | null {
    const [actualSignature, payload] = token.split(".", 2);

    if (!actualSignature || !payload) {
        return null;
    }

    const expectedSignature = sign(payload);
    const expectedBuf = Buffer.from(expectedSignature, "hex");
    const actualBuf = Buffer.from(actualSignature, "hex");

    if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
        return null;
    }

    try {
        const decoded = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
            userId?: unknown;
            phone?: unknown;
            code?: unknown;
            expiresAt?: unknown;
        };

        if (
            typeof decoded.userId !== "string"
            || typeof decoded.phone !== "string"
            || typeof decoded.code !== "string"
            || typeof decoded.expiresAt !== "number"
            || decoded.expiresAt < Date.now()
        ) {
            return null;
        }

        return {
            userId: decoded.userId,
            phone: decoded.phone,
            code: decoded.code
        };
    } catch {
        return null;
    }
}
