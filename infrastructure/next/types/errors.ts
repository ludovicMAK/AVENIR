import { JsonValue } from "@/types/json"

export type ApiErrorCode =
    | "VALIDATION_ERROR"
    | "UNAUTHORIZED"
    | "NOT_FOUND"
    | "CONFLICT"
    | "UNPROCESSABLE_ENTITY"
    | "APPLICATION_ERROR"
    | "INFRASTRUCTURE_ERROR"

export type ApiErrorDetail = JsonValue

export type ApiErrorInput = string | number | boolean | bigint | symbol | object | null | undefined