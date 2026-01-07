import { cookies } from "next/headers"

import { usersApi } from "@/api/users"
import { AUTH_COOKIE_NAME, AUTH_USER_ID_COOKIE_NAME } from "@/lib/auth/constants"
import { UserSummary } from "@/types/users"

export async function getCurrentUser(): Promise<UserSummary | null> {
    const cookieStore = await cookies()
    const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value
    const authUserId = cookieStore.get(AUTH_USER_ID_COOKIE_NAME)?.value
    if (!authToken || !authUserId) return null

    try {
        return await usersApi.me(authToken, authUserId)
    } catch {
        return null
    }
}
