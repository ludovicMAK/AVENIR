import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonObject, JsonValue } from "@/types/json";
import { ApiErrorCode } from "@/types/errors";

// Adapters: Choose backend via NEXT_PUBLIC_API_BASE_URL
// - If set (e.g., http://localhost:8000/api) → Use Express backend
// - If empty → Use Next.js API routes (/api/*)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function request<ResponseBody extends JsonValue = JsonValue>(
  path: string,
  options: RequestInit = {}
): Promise<ResponseBody> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const fullUrl = `${API_BASE_URL}${path}`;
  console.log("[API Client] Calling:", fullUrl, "| BASE_URL:", API_BASE_URL);

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "INFRASTRUCTURE_ERROR",
      "Unable to reach the server. Please try again later."
    );
  }

  const data = (await response.json().catch(() => null)) as JsonValue | null;

  // Express format: {status, code, message, data}
  const responseBody: JsonObject | null = isJsonObject(data) ? data : null;

  // Check Express status field OR HTTP response.ok
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

  // If response has Express format {status, code, message, data}, extract data field
  // Otherwise return the full response (for Next.js API routes compatibility)
  if (
    responseBody &&
    "data" in responseBody &&
    typeof responseBody.status === "number"
  ) {
    return responseBody.data as ResponseBody;
  }

  return data as ResponseBody;
}
