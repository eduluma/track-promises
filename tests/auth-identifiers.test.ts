import { describe, expect, it } from "vitest";

import {
    getSyntheticIdentifierType,
    hasVerifiedContact,
    isVerifiedAccount,
    isSyntheticIdentifierEmail,
    normalizeIdentifierToEmail,
    normalizePhoneNumber
} from "@/modules/auth/identifiers";

describe("auth identifiers", () => {
    it("normalizes phone numbers to a stable E.164-like format", () => {
        expect(normalizePhoneNumber("+91 98765 43210")).toBe("+919876543210");
    });

    it("uses normalized phone numbers for synthetic credential emails", () => {
        expect(normalizeIdentifierToEmail("phone", "+91 98765 43210")).toBe("phone:919876543210@signup.local");
    });

    it("rejects impossible phone numbers", () => {
        expect(() => normalizePhoneNumber("1234")).toThrow("Phone numbers must contain 8 to 15 digits.");
    });

    it("recognizes synthetic identifier emails", () => {
        expect(isSyntheticIdentifierEmail("phone:919876543210@signup.local")).toBe(true);
        expect(isSyntheticIdentifierEmail("user@example.com")).toBe(false);
        expect(getSyntheticIdentifierType("phone:919876543210@signup.local")).toBe("phone");
        expect(getSyntheticIdentifierType("user@example.com")).toBeNull();
    });

    it("treats either email or phone verification as a verified contact", () => {
        expect(hasVerifiedContact({ emailVerified: true, phoneVerified: false })).toBe(true);
        expect(hasVerifiedContact({ emailVerified: false, phoneVerified: true })).toBe(true);
        expect(hasVerifiedContact({ emailVerified: false, phoneVerified: false })).toBe(false);
    });

    it("treats moderator-approved accounts as verified even without a contact factor", () => {
        expect(isVerifiedAccount({ emailVerified: false, phoneVerified: false, state: "moderator_approved" })).toBe(true);
        expect(isVerifiedAccount({ emailVerified: false, phoneVerified: false, state: "verified" })).toBe(false);
    });
});
