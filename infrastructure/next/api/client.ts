import { ApiError } from "@/lib/errors"
import { isJsonObject } from "@/lib/json"
import { JsonObject, JsonValue } from "@/types/json"
import { ApiErrorCode } from "@/types/errors"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL required environment variable is missing")
}

export async function request<ResponseBody extends JsonValue = JsonValue>(path: string, options: RequestInit = {}): Promise<ResponseBody> {
    const headers = new Headers(options.headers)
    headers.set("Content-Type", "application/json")

    let response: Response
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
        })
    } catch {
        throw new ApiError("INFRASTRUCTURE_ERROR", "Unable to reach the server. Please try again later.")
    }

    const data = (await response.json().catch(() => null)) as JsonValue | null

    if (!response.ok) {
        const errorBody: JsonObject | null = isJsonObject(data) ? data : null
        const message = typeof errorBody?.message === "string" ? errorBody.message : "Request failed"
        const payload = errorBody?.data
        const codeValue = errorBody?.code
        const resolvedCode: ApiErrorCode =
            typeof codeValue === "string" ? (codeValue as ApiErrorCode) : "INFRASTRUCTURE_ERROR"

        throw new ApiError(resolvedCode, message, payload)
    }

    return data as ResponseBody
}