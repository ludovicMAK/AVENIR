import { LoginPayload, RegisterPayload, LoginSuccessResponse } from "@/types/auth"
import { request } from "./client"

export const authApi = {
    async login(payload: LoginPayload) {
        return request<LoginSuccessResponse>("/login", {
            method: "POST",
            body: JSON.stringify(payload),
        })
    },

    async register(payload: RegisterPayload) {
        return request("/users/register", {
            method: "POST",
            body: JSON.stringify(payload),
        })
    },

    async confirmRegistration(token: string) {
        return request(`/users/confirm-registration?token=${token}`, {
            method: "GET",
        })
    },
}