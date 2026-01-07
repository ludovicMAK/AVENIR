export const AUTH_COOKIE_NAME = "avenir-auth";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;
export const AUTH_COOKIE_PATH = "/";
export const AUTH_COOKIE_SAME_SITE: "lax" | "strict" | "none" = "lax";
export const AUTH_USER_ID_COOKIE_NAME = "avenir-auth-user";
export const AUTH_USER_ID_COOKIE_MAX_AGE_SECONDS = AUTH_COOKIE_MAX_AGE_SECONDS;
export const AUTH_USER_ID_COOKIE_PATH = AUTH_COOKIE_PATH;
export const AUTH_USER_ID_COOKIE_SAME_SITE: "lax" | "strict" | "none" = AUTH_COOKIE_SAME_SITE;

export const REDIRECT_COOKIE_NAME = "avenir-redirect";
export const REDIRECT_COOKIE_MAX_AGE_SECONDS = 60 * 5;
export const REDIRECT_COOKIE_PATH = "/";
export const REDIRECT_COOKIE_SAME_SITE: "lax" | "strict" | "none" = "lax";
