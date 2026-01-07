import { ApiError } from "@/lib/errors"
import { isJsonObject } from "@/lib/json"
import { JsonValue } from "@/types/json"
import { UserSummary } from "@/types/users"
import { request } from "./client"

type UsersResponseBody = {
    data?: {
        users?: JsonValue
    }
}

type UserResponseBody = {
    data?: {
        user?: JsonValue
    }
}

const invalidUsersResponseError = () =>
    new ApiError("INFRASTRUCTURE_ERROR", "Invalid users payload received from API.")

const toUserSummary = (value: JsonValue): UserSummary => {
    if (!isJsonObject(value)) throw invalidUsersResponseError()

    const id = value.id
    const firstname = value.firstname
    const lastname = value.lastname

    if (typeof id !== "string" || typeof firstname !== "string" || typeof lastname !== "string") {
        throw invalidUsersResponseError()
    }

    return { id, firstname, lastname }
}

const extractUsers = (response: JsonValue): UserSummary[] => {
    if (!isJsonObject(response)) throw invalidUsersResponseError()

    const data = response.data
    if (!isJsonObject(data)) throw invalidUsersResponseError()

    const usersJson = (data as UsersResponseBody["data"])?.users
    if (!Array.isArray(usersJson)) throw invalidUsersResponseError()

    return usersJson.map(toUserSummary)
}

const extractUser = (response: JsonValue): UserSummary => {
    if (!isJsonObject(response)) throw invalidUsersResponseError()

    const data = response.data
    if (!isJsonObject(data)) throw invalidUsersResponseError()

    const userJson = (data as UserResponseBody["data"])?.user
    if (userJson === undefined || !isJsonObject(userJson)) throw invalidUsersResponseError()

    return toUserSummary(userJson)
}

export const usersApi = {
    async list(authToken?: string): Promise<UserSummary[]> {
        const response = await request<JsonValue>("/users", {
            method: "GET",
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        })

        return extractUsers(response)
    },

    async me(authToken: string): Promise<UserSummary> {
        const response = await request<JsonValue>("/users/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` },
        })

        return extractUser(response)
    },
}
