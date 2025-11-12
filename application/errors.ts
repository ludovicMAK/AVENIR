export abstract class ApplicationError extends Error {
    public readonly status: number;
    public readonly code: string;
    public readonly data?: unknown;
    public readonly headers?: Record<string, string>;

    protected constructor(status: number, code: string, message: string, data?: unknown, headers?: Record<string, string>) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.status = status;
        this.code = code;
        this.data = data;
        this.headers = headers;
        this.name = this.constructor.name;
    }

    public toPayload(): Record<string, unknown> {
        const payload: Record<string, unknown> = { ok: false, code: this.code, message: this.message };
        if (this.data !== undefined) payload.data = this.data;
        return payload;
    }
}

export class ValidationError extends ApplicationError {
    public constructor(message = "Invalid data", data?: unknown) {
        super(400, "VALIDATION_ERROR", message, data);
    }
}

export class UnauthorizedError extends ApplicationError {
    public constructor(message = "Unauthorized", data?: unknown) {
        super(401, "UNAUTHORIZED", message, data);
    }
}

export class NotFoundError extends ApplicationError {
    public constructor(message = "Not found", data?: unknown) {
        super(404, "NOT_FOUND", message, data);
    }
}

export class ConflictError extends ApplicationError {
    public constructor(message = "Conflict", data?: unknown) {
        super(409, "CONFLICT", message, data);
    }
}

export class UnprocessableError extends ApplicationError {
    public constructor(message = "Unprocessable entity", data?: unknown) {
        super(422, "APPLICATION_ERROR", message, data);
    }
}

export class InfrastructureError extends ApplicationError {
    public constructor(message = "Internal server error", data?: unknown) {
        super(500, "INFRASTRUCTURE_ERROR", message, data);
    }
}
