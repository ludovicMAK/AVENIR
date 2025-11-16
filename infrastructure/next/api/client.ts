import {
    ValidationError,
    UnauthorizedError,
    NotFoundError,
    ConflictError,
    UnprocessableError,
    InfrastructureError,
} from "../../../application/errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function request(path: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
        });
    } catch {
        throw new InfrastructureError("Unable to reach the server. Please try again later.");
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = (data?.message as string | undefined) ?? "Request failed";
        const payload = data?.data;
        const code = data?.code as string | undefined;

        switch (code) {
            case "VALIDATION_ERROR":
                throw new ValidationError(message, payload);
            case "UNAUTHORIZED":
                throw new UnauthorizedError(message, payload);
            case "NOT_FOUND":
                throw new NotFoundError(message, payload);
            case "CONFLICT":
                throw new ConflictError(message, payload);
            case "UNPROCESSABLE_ENTITY":
            case "APPLICATION_ERROR":
                throw new UnprocessableError(message, payload);
            case "INFRASTRUCTURE_ERROR":
                throw new InfrastructureError(message, payload);
            default:
                throw new InfrastructureError(message, payload);
        }
    }

    return data;
}

