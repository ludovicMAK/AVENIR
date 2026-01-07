export type LoginPayload = {
    email: string
    password: string
}

export type AuthenticatedUser = {
    id: string
    firstname: string
    lastname: string
    email: string
    role: string
}

export type LoginSuccessResponse = {
    ok: true
    code: string
    message?: string
    data: {
        user: AuthenticatedUser
        token: string
    }
}

export type RegisterPayload = {
    firstname: string
    lastname: string
    email: string
    password: string
}

export type CookieOptions = {
    maxAge: number
    path?: string
    sameSite?: "lax" | "strict" | "none"
}
