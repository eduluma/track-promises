import { describe, expect, it } from "vitest";

import { consumePasswordResetToken, createPasswordResetToken } from "@/modules/auth/password-reset-tokens";

describe("password reset tokens", () => {
    it("creates and consumes a valid password reset token", () => {
        const token = createPasswordResetToken("user-1", "user@example.com");

        expect(consumePasswordResetToken(token)).toEqual({
            userId: "user-1",
            email: "user@example.com"
        });
    });

    it("rejects a tampered password reset token", () => {
        const token = createPasswordResetToken("user-1", "user@example.com");
        const tampered = `${token}tampered`;

        expect(consumePasswordResetToken(tampered)).toBeNull();
    });
});