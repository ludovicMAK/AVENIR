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

export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
} as const;

const AUTH_PAGES = new Set<string>([PATHS.LOGIN, PATHS.REGISTER]);

export function middleware(request: NextRequest) {
  const authenticated = isAuthenticated(request);
  const { pathname } = request.nextUrl;

  const isHome = pathname === PATHS.HOME;
  const isAuthPage = AUTH_PAGES.has(pathname);

  // La page d'accueil (/) est publique, donc on ne redirige plus
  // Seules les pages protégées comme /dashboard nécessitent l'authentification
  if (!isAuthPage) {
    return NextResponse.next();
  }

  // Si on est sur une page d'auth (login/register) et qu'on est déjà connecté
  // Rediriger vers /dashboard au lieu de /
  if (isAuthPage && authenticated) {
    const redirectHint = request.cookies.get(REDIRECT_COOKIE_NAME)?.value;
    const fallback = PATHS.DASHBOARD;
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
