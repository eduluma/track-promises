import { getServerSession } from "next-auth";

import { authOptions } from "@/modules/auth/options";

export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user ?? null;
}