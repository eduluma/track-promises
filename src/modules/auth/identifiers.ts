export type IdentifierType = "email" | "phone" | "aadhaar" | "pan";

export function normalizePhoneNumber(value: string): string {
    const digits = value.replace(/\D/g, "");

    if (digits.length < 8 || digits.length > 15) {
        throw new Error("Phone numbers must contain 8 to 15 digits.");
    }

    return `+${digits}`;
}

export function maskPhoneNumber(value: string): string {
    const normalized = normalizePhoneNumber(value);
    const digits = normalized.slice(1);

    if (digits.length <= 4) {
        return normalized;
    }

    return `+${digits.slice(0, Math.min(2, digits.length - 4))}${"*".repeat(Math.max(0, digits.length - 6))}${digits.slice(-4)}`;
}

export function normalizeIdentifierToEmail(type: IdentifierType, value: string): string {
    switch (type) {
        case "email":
            return value.toLowerCase().trim();
        case "phone":
            return `phone:${normalizePhoneNumber(value).slice(1)}@signup.local`;
        case "aadhaar":
            return `aadhaar:${value.replace(/\D/g, "")}@signup.local`;
        case "pan":
            return `pan:${value.toUpperCase().replace(/\s/g, "")}@signup.local`;
    }
}

export function isSyntheticIdentifierEmail(email: string): boolean {
    return email.endsWith("@signup.local");
}

export function getSyntheticIdentifierType(email: string): Exclude<IdentifierType, "email"> | null {
    const match = email.toLowerCase().match(/^(phone|aadhaar|pan):.+@signup\.local$/);
    return match ? (match[1] as Exclude<IdentifierType, "email">) : null;
}

export function hasVerifiedContact(user: { emailVerified: boolean; phoneVerified?: boolean }): boolean {
    return user.emailVerified || user.phoneVerified === true;
}

export function isVerifiedAccount(user: {
    emailVerified: boolean;
    phoneVerified?: boolean;
    state: "unverified" | "verified" | "readonly" | "suspended" | "moderator_approved";
}): boolean {
    if (user.state === "moderator_approved") {
        return true;
    }

    return user.state === "verified" && hasVerifiedContact(user);
}
