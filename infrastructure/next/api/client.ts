import { ApiError } from "@/lib/errors/apiError";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL required environment variable is missing");
}

export async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
        });
    } catch {
        throw new ApiError("INFRASTRUCTURE_ERROR", "Unable to reach the server. Please try again later.");
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = (data?.message as string | undefined) ?? "Request failed";
        const payload = data?.data;
        const code = data?.code as string | undefined;

        throw new ApiError(code ?? "INFRASTRUCTURE_ERROR", message, payload);
    }

    return data as T;
}

