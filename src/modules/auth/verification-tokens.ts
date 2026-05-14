import { createHmac, timingSafeEqual } from "crypto";

function sign(payload: string): string {
    const secret = process.env.NEXTAUTH_SECRET ?? "dev-secret";
    return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createVerificationToken(userId: string, email: string): string {
    const payload = Buffer.from(
        JSON.stringify({
            userId,
            email,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
        })
    ).toString("base64url");

    return `${sign(payload)}.${payload}`;
}

export function consumeVerificationToken(token: string): { userId: string; email: string } | null {
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
            email?: unknown;
            expiresAt?: unknown;
        };

        if (
            typeof decoded.userId !== "string"
            || typeof decoded.email !== "string"
            || typeof decoded.expiresAt !== "number"
            || decoded.expiresAt < Date.now()
        ) {
            return null;
        }

        return { userId: decoded.userId, email: decoded.email };
    } catch {
        return null;
    }
}
