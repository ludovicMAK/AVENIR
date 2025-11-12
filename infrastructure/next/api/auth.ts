import { LoginPayload, RegisterPayload } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request(path: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.message || "Request failed";
        throw new Error(message);
    }

    return data;
}

export const authApi = {
    async login(payload: LoginPayload) {
        return request("/api/login", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    async register(payload: RegisterPayload) {
        return request("/api/users/register", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
};
