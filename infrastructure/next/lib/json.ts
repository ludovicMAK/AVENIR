import { JsonObject, JsonValue } from "@/types/json"

export function isJsonObject(value: JsonValue | null): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}