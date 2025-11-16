export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthenticatedUser {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
}

export interface LoginSuccessResponse {
    ok: true;
    code: string;
    message?: string;
    data: {
        user: AuthenticatedUser;
    };
}

export interface RegisterPayload {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}