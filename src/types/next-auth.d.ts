import type { DefaultSession } from "next-auth";

import type { AccountState, UserRole } from "@/lib/permissions";

declare module "next-auth" {
    interface Session {
        user: DefaultSession["user"] & {
            id: string;
            role: UserRole;
            state: AccountState;
            emailVerified: boolean;
            tenantIds: string[];
        };
    }

    interface User {
        role: UserRole;
        state: AccountState;
        emailVerified: boolean;
        tenantIds: string[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: UserRole;
        state?: AccountState;
        emailVerified?: boolean;
        tenantIds?: string[];
    }
}