import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonObject, JsonValue } from "@/types/json";
import { ApiErrorCode } from "@/types/errors";
import { getAuthenticationToken } from "@/lib/auth/client";

// Adapters: Choose backend via NEXT_PUBLIC_API_BASE_URL
// - If set (e.g., http://localhost:8000/api) → Use Express backend
// - If empty → Use Next.js API routes (/api/*)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

let cachedUserId: string | null = null;

export function setCurrentUserId(userId: string | null) {
  cachedUserId = userId;
}

export function getCurrentUserId(): string | null {
  return cachedUserId;
}

export async function request<ResponseBody extends JsonValue = JsonValue>(
  path: string,
  options: RequestInit = {}
): Promise<ResponseBody> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (typeof window !== "undefined") {
    const token = getAuthenticationToken();
    const userId = getCurrentUserId();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (userId) {
      headers.set("x-user-id", userId);
    }
  }

  const fullUrl = `${API_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "INFRASTRUCTURE_ERROR",
      "Unable to reach the server. Please try again later."
    );
  }

  const data = (await response.json().catch(() => null)) as JsonValue | null;

  const responseBody: JsonObject | null = isJsonObject(data) ? data : null;

  const isSuccess =
    response.ok ||
    (typeof responseBody?.status === "number" &&
      responseBody.status >= 200 &&
      responseBody.status < 300);

  if (!isSuccess) {
    const message =
      typeof responseBody?.message === "string"
        ? responseBody.message
        : "Request failed";
    const payload = responseBody?.data;
    const codeValue = responseBody?.code;
    const resolvedCode: ApiErrorCode =
      typeof codeValue === "string"
        ? (codeValue as ApiErrorCode)
        : "INFRASTRUCTURE_ERROR";

    throw new ApiError(resolvedCode, message, payload);
  }

  if (
    responseBody &&
    "data" in responseBody &&
    typeof responseBody.status === "number"
  ) {
    return responseBody.data as ResponseBody;
  }

  return data as ResponseBody;
}
