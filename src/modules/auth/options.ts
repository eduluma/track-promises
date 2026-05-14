import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import { z } from "zod";

import { getPersistedUserByEmail, getPersistedUserById } from "@/modules/auth/user-store";

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

function applyTokenUserState(
    token: Record<string, unknown>,
    user: {
        id: string;
        role: string;
        state: string;
        emailVerified: boolean;
        phoneVerified: boolean;
        tenantIds?: string[];
    }
) {
    token.id = user.id;
    token.role = user.role;
    token.state = user.state;
    token.emailVerified = user.emailVerified === true;
    token.phoneVerified = user.phoneVerified === true;
    token.tenantIds = user.tenantIds ?? [];
}

function isCredentialsUser(
    user: unknown
): user is {
    id: string;
    role: string;
    state: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    tenantIds?: string[];
} {
    return !!user
        && typeof user === "object"
        && typeof (user as { id?: unknown }).id === "string"
        && typeof (user as { role?: unknown }).role === "string"
        && typeof (user as { state?: unknown }).state === "string"
        && typeof (user as { emailVerified?: unknown }).emailVerified === "boolean"
        && typeof (user as { phoneVerified?: unknown }).phoneVerified === "boolean";
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    },
    providers: [
        CredentialsProvider({
            name: "Demo credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize(rawCredentials) {
                const parsed = credentialsSchema.safeParse(rawCredentials);

                if (!parsed.success) {
                    return null;
                }

                try {
                    const dbUser = await getPersistedUserByEmail(parsed.data.email);

                    if (!dbUser) return null;

                    const valid = compareSync(parsed.data.password, dbUser.passwordHash);
                    if (!valid) return null;

                    return {
                        id: dbUser.id,
                        email: dbUser.email,
                        name: dbUser.displayName,
                        role: dbUser.role,
                        state: dbUser.state,
                        emailVerified: dbUser.emailVerified,
                        phoneVerified: dbUser.phoneVerified,
                        tenantIds: []
                    };
                } catch (err) {
                    console.error("[authorize] DB lookup failed:", err);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (isCredentialsUser(user)) {
                applyTokenUserState(token, user);
            }

            const tokenUserId = typeof token.id === "string" ? token.id : null;

            if (tokenUserId) {
                try {
                    const dbUser = await getPersistedUserById(tokenUserId);

                    if (dbUser) {
                        applyTokenUserState(token, { ...dbUser, tenantIds: [] });
                    }
                } catch (err) {
                    console.error("[jwt] user refresh failed:", err);
                }
            }

            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = typeof token.id === "string" ? token.id : "";
                session.user.role = token.role ?? "user";
                session.user.state = token.state ?? "unverified";
                session.user.emailVerified = token.emailVerified === true;
                session.user.phoneVerified = token.phoneVerified === true;
                session.user.tenantIds = Array.isArray(token.tenantIds)
                    ? token.tenantIds.filter((value): value is string => typeof value === "string")
                    : [];
            }

            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET
};