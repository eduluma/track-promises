import { createHmac, timingSafeEqual } from "crypto";

// In-memory token store — survives HMR reloads, cleared on process restart.
const globalForTokens = globalThis as typeof globalThis & {
    __trackPromisesVerifyTokens?: Map<string, { userId: string; email: string; expiresAt: number }>;
};

function getTokenStore() {
    if (!globalForTokens.__trackPromisesVerifyTokens) {
        globalForTokens.__trackPromisesVerifyTokens = new Map();
    }
    return globalForTokens.__trackPromisesVerifyTokens;
}

function sign(payload: string): string {
    const secret = process.env.NEXTAUTH_SECRET ?? "dev-secret";
    return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createVerificationToken(userId: string, email: string): string {
    const store = getTokenStore();
    // Purge any existing token for this user
    for (const [token, record] of store) {
        if (record.userId === userId) store.delete(token);
    }

    const raw = `${userId}:${email}:${Date.now()}`;
    const token = sign(raw) + Buffer.from(raw).toString("base64url");
    store.set(token, { userId, email, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    return token;
}

export function consumeVerificationToken(token: string): { userId: string; email: string } | null {
    const store = getTokenStore();
    const record = store.get(token);

    if (!record) return null;
    if (record.expiresAt < Date.now()) {
        store.delete(token);
        return null;
    }

    // Verify HMAC to prevent token forgery
    const base64Part = token.slice(64); // first 64 chars = 32-byte hex HMAC
    const raw = Buffer.from(base64Part, "base64url").toString();
    const expected = sign(raw);
    const actual = token.slice(0, 64);

    const expectedBuf = Buffer.from(expected, "hex");
    const actualBuf = Buffer.from(actual, "hex");

    if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
        return null;
    }

    store.delete(token);
    return { userId: record.userId, email: record.email };
}
