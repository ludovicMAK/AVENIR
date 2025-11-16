export type ApiErrorCode =
    | "VALIDATION_ERROR"
    | "UNAUTHORIZED"
    | "NOT_FOUND"
    | "CONFLICT"
    | "UNPROCESSABLE_ENTITY"
    | "APPLICATION_ERROR"
    | "INFRASTRUCTURE_ERROR"
    | string;

export class ApiError extends Error {
    public readonly code: ApiErrorCode;
    public readonly details?: unknown;

    constructor(code: ApiErrorCode, message: string, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.details = details;
    }
}

export function isApiError(value: unknown): value is ApiError {
    return value instanceof ApiError;
}

