import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { authenticateDemoUser } from "@/modules/auth/demo-users";

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
            authorize(rawCredentials) {
                const parsed = credentialsSchema.safeParse(rawCredentials);

                if (!parsed.success) {
                    return null;
                }

                const user = authenticateDemoUser(parsed.data.email, parsed.data.password);

                if (!user) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.displayName,
                    role: user.role,
                    state: user.state,
                    emailVerified: user.emailVerified,
                    tenantIds: user.tenantIds
                };
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