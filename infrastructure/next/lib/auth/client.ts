"use client"

import {
    AUTH_COOKIE_MAX_AGE_SECONDS,
    AUTH_COOKIE_NAME,
    AUTH_COOKIE_PATH,
    AUTH_COOKIE_SAME_SITE,
    AUTH_USER_ID_COOKIE_MAX_AGE_SECONDS,
    AUTH_USER_ID_COOKIE_NAME,
    AUTH_USER_ID_COOKIE_PATH,
    AUTH_USER_ID_COOKIE_SAME_SITE,
    REDIRECT_COOKIE_NAME,
    REDIRECT_COOKIE_PATH,
    REDIRECT_COOKIE_SAME_SITE,
} from "./constants"
import { CookieOptions } from "@/types/auth"

function buildCookie(name: string, value: string, options: CookieOptions) {
    const {
        maxAge,
        path = "/",
        sameSite = "lax",
    } = options

    const attributes = [
        `${name}=${encodeURIComponent(value)}`,
        `Path=${path}`,
        `Max-Age=${maxAge}`,
        `SameSite=${sameSite}`,
    ]

    if (typeof window !== "undefined" && window.location.protocol === "https:") {
        attributes.push("Secure")
    }

    return attributes.join("; ")
}

function readCookie(name: string): string | null {
    const entries = document.cookie?.split(";") ?? []
    for (const entry of entries) {
        const [key, ...rest] = entry.trim().split("=")
        if (key === name) {
            return decodeURIComponent(rest.join("="))
        }
    }
    return null
}

export function persistAuthentication(userToken: string, userId: string) {
    document.cookie = buildCookie(AUTH_COOKIE_NAME, userToken, {
        maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
        path: AUTH_COOKIE_PATH,
        sameSite: AUTH_COOKIE_SAME_SITE,
    })
    document.cookie = buildCookie(AUTH_USER_ID_COOKIE_NAME, userId, {
        maxAge: AUTH_USER_ID_COOKIE_MAX_AGE_SECONDS,
        path: AUTH_USER_ID_COOKIE_PATH,
        sameSite: AUTH_USER_ID_COOKIE_SAME_SITE,
    })
}

export function clearAuthentication() {
    document.cookie = buildCookie(AUTH_COOKIE_NAME, "", {
        maxAge: 0,
        path: AUTH_COOKIE_PATH,
        sameSite: AUTH_COOKIE_SAME_SITE,
    })
    document.cookie = buildCookie(AUTH_USER_ID_COOKIE_NAME, "", {
        maxAge: 0,
        path: AUTH_USER_ID_COOKIE_PATH,
        sameSite: AUTH_USER_ID_COOKIE_SAME_SITE,
    })
}

export function getAuthenticationToken(): string | null {
    return readCookie(AUTH_COOKIE_NAME)
}

export function getAuthenticatedUserId(): string | null {
    return readCookie(AUTH_USER_ID_COOKIE_NAME)
}

export function getRedirectHint(): string | null {
    return readCookie(REDIRECT_COOKIE_NAME)
}

export function clearRedirectHint() {
    document.cookie = buildCookie(REDIRECT_COOKIE_NAME, "", {
        maxAge: 0,
        path: REDIRECT_COOKIE_PATH,
        sameSite: REDIRECT_COOKIE_SAME_SITE,
    })
}
