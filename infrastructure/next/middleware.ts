import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth/server";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import {
    REDIRECT_COOKIE_NAME,
    REDIRECT_COOKIE_MAX_AGE_SECONDS,
    REDIRECT_COOKIE_PATH,
    REDIRECT_COOKIE_SAME_SITE,
} from "@/lib/auth/constants";

const HOME_PATH = "/";
const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";
const AUTH_PAGES = new Set([LOGIN_PATH, REGISTER_PATH]);

export function middleware(request: NextRequest) {
    const authenticated = isAuthenticated(request);
    const { pathname } = request.nextUrl;

    const isHome = pathname === HOME_PATH;
    const isAuthPage = AUTH_PAGES.has(pathname);

    if (isHome && !authenticated) {
        const loginUrl = new URL(LOGIN_PATH, request.url);
        const response = NextResponse.redirect(loginUrl);

        const redirectPath = sanitizeRedirectPath(pathname, HOME_PATH);
        response.cookies.set(REDIRECT_COOKIE_NAME, redirectPath, {
            path: REDIRECT_COOKIE_PATH,
            maxAge: REDIRECT_COOKIE_MAX_AGE_SECONDS,
            sameSite: REDIRECT_COOKIE_SAME_SITE,
            httpOnly: false,
        });

        return response;
    }

    if (isAuthPage && authenticated) {
        const redirectHint = request.cookies.get(REDIRECT_COOKIE_NAME)?.value;
        const fallback = HOME_PATH;
        const destinationPath = sanitizeRedirectPath(redirectHint, fallback);
        const destination = new URL(destinationPath, request.url);

        const response = NextResponse.redirect(destination);
        response.cookies.set(REDIRECT_COOKIE_NAME, "", {
            path: REDIRECT_COOKIE_PATH,
            maxAge: 0,
            sameSite: REDIRECT_COOKIE_SAME_SITE,
        });
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [HOME_PATH, LOGIN_PATH, REGISTER_PATH],
};

