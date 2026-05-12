import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authenticateDemoUser } from "@/modules/auth/demo-users";
import { createDbClient } from "@/db/client";
import { users } from "@/db/schema";

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

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

                // Check in-memory store first (covers seed/demo users and users
                // registered in the current server process).
                const memUser = authenticateDemoUser(parsed.data.email, parsed.data.password);
                if (memUser) {
                    return {
                        id: memUser.id,
                        email: memUser.email,
                        name: memUser.displayName,
                        role: memUser.role,
                        state: memUser.state,
                        emailVerified: memUser.emailVerified,
                        tenantIds: memUser.tenantIds
                    };
                }

                // Fall back to the database for users registered in a previous
                // server instance (the authoritative store after restart).
                try {
                    const db = createDbClient();
                    const [dbUser] = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, parsed.data.email.toLowerCase()))
                        .limit(1);

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
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.state = user.state;
                token.emailVerified = user.emailVerified === true;
                token.tenantIds = user.tenantIds;
            }

            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = typeof token.id === "string" ? token.id : "";
                session.user.role = token.role ?? "user";
                session.user.state = token.state ?? "unverified";
                session.user.emailVerified = token.emailVerified === true;
                session.user.tenantIds = Array.isArray(token.tenantIds)
                    ? token.tenantIds.filter((value): value is string => typeof value === "string")
                    : [];
            }

            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET
};