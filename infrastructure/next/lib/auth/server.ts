import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "./constants";

export function isAuthenticated(request: NextRequest): boolean {
    return Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}
