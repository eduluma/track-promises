import { describe, expect, it } from "vitest";

import {
    consumePhoneVerificationToken,
    createPhoneVerificationCode,
    createPhoneVerificationToken
} from "@/modules/auth/phone-verification-tokens";

describe("phone verification tokens", () => {
    it("creates 6-digit verification codes", () => {
        expect(createPhoneVerificationCode()).toMatch(/^\d{6}$/);
    });

    it("creates and consumes a valid phone verification token", () => {
        const token = createPhoneVerificationToken("user-1", "+919876543210", "123456");

        expect(consumePhoneVerificationToken(token)).toEqual({
            userId: "user-1",
            phone: "+919876543210",
            code: "123456"
        });
    });

    it("rejects tampered phone verification tokens", () => {
        const token = createPhoneVerificationToken("user-1", "+919876543210", "123456");

        expect(consumePhoneVerificationToken(`${token}tampered`)).toBeNull();
    });
});
