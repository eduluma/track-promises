import { apiUserContextSchema, type ApiUserContext } from "@/modules/api/contracts";

export const API_USER_CONTEXT_HEADER = "x-track-promises-user";

export function encodeApiUserContext(user: ApiUserContext) {
    return Buffer.from(JSON.stringify(apiUserContextSchema.parse(user)), "utf8").toString("base64url");
}

export function decodeApiUserContext(rawValue: string | null | undefined) {
    if (!rawValue) {
        return null;
    }

    try {
        const parsed = JSON.parse(Buffer.from(rawValue, "base64url").toString("utf8"));
        return apiUserContextSchema.parse(parsed);
    } catch {
        return null;
    }
}