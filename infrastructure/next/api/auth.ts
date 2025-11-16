import { LoginPayload, RegisterPayload } from "@/types/auth"
import { request } from "./client"

export const authApi = {
    async login(payload: LoginPayload) {
        return request("/login", {
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
}