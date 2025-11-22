export function ensureError(value: unknown, fallbackMessage = "Unexpected error"): Error {
    if (value instanceof Error) return value
    if (typeof value === "string") return new Error(value)
    return new Error(fallbackMessage)
}