import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonObject, JsonValue } from "@/types/json";
import { ApiErrorCode } from "@/types/errors";
import { getAuthenticationToken } from "@/lib/auth/client";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

let cachedUserId: string | null = null;

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function setCurrentUserId(userId: string | null) {
  if (userId && isValidUUID(userId)) {
    cachedUserId = userId;
    console.log('[API Client] Valid userId set:', userId);
  } else {
    console.warn('[API Client] Invalid userId rejected:', userId);
    cachedUserId = null;
  }
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

    const isUserMeEndpoint = path === "/users/me";
    const isPublicAuthEndpoint = path === "/login" || path === "/register" || path === "/users/confirm-registration";
    
    if (!isUserMeEndpoint && !isPublicAuthEndpoint) {
      if (userId && isValidUUID(userId)) {
        headers.set("x-user-id", userId);
        console.log('[API Request]', path, '- userId:', userId);
      } else if (userId) {
        console.warn('[API Request]', path, '- Invalid userId NOT sent:', userId);
      } else {
        console.warn('[API Request]', path, '- No userId available');
      }
    } else if (isUserMeEndpoint || isPublicAuthEndpoint) {
      console.log('[API Request]', path, '- Public/special endpoint, skipping x-user-id header');
    }
  }

  const fullUrl = `${API_BASE_URL}/api${path}`;

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
