import { ApiErrorCode, ApiErrorDetail, ApiErrorInput } from "@/types/errors"

export class ApiError extends Error {
    public readonly code: ApiErrorCode
    public readonly details?: ApiErrorDetail

    constructor(code: ApiErrorCode, message: string, details?: ApiErrorDetail) {
        super(message)
        this.name = "ApiError"
        this.code = code
        this.details = details
    }
}

export function isApiError(value: ApiErrorInput): value is ApiError {
    return value instanceof ApiError
}