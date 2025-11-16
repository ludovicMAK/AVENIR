export abstract class ApplicationError extends Error {
    public readonly code: string
    public readonly details?: unknown

    protected constructor(code: string, message: string, details?: unknown) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
        this.code = code
        this.details = details
        this.name = this.constructor.name
    }

    public toPayload(): Record<string, unknown> {
        const payload: Record<string, unknown> = { ok: false, code: this.code, message: this.message }
        if (this.details !== undefined) payload.data = this.details
        return payload
    }
}

export class ValidationError extends ApplicationError {
    public constructor(message = "Invalid data", details?: unknown) {
        super("VALIDATION_ERROR", message, details)
    }
}

export class UnauthorizedError extends ApplicationError {
    public constructor(message = "Unauthorized", details?: unknown) {
        super("UNAUTHORIZED", message, details)
    }
}

export class NotFoundError extends ApplicationError {
    public constructor(message = "Not found", details?: unknown) {
        super("NOT_FOUND", message, details)
    }
}

export class ConflictError extends ApplicationError {
    public constructor(message = "Conflict", details?: unknown) {
        super("CONFLICT", message, details)
    }
}

export class UnprocessableError extends ApplicationError {
    public constructor(message = "Unprocessable entity", details?: unknown) {
        super("APPLICATION_ERROR", message, details)
    }
}

export class InfrastructureError extends ApplicationError {
    public constructor(message = "Internal server error", details?: unknown) {
        super("INFRASTRUCTURE_ERROR", message, details)
    }
}
