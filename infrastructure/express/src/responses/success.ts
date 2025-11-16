import { Response } from "express"
import { SuccessOptions } from "@express/types/responses"

export function sendSuccess<T>(response: Response, options: SuccessOptions<T>) {
    const {
        status = 200,
        code,
        message,
        data,
        headers,
    } = options

    if (headers) {
        for (const [key, value] of Object.entries(headers)) {
            response.setHeader(key, value)
        }
    }

    const payload: Record<string, unknown> = { ok: true, code }
    if (message) payload.message = message
    if (data !== undefined) payload.data = data

    return response.status(status).json(payload)
}