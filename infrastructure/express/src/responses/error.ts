import { Response } from "express"
import { ZodError } from "zod"
import {
    ApplicationError,
    ConflictError,
    ForbiddenError,
    InfrastructureError,
    NotFoundError,
    UnauthorizedError,
    UnprocessableError,
    ValidationError,
} from "@application/errors"
import { ensureError, ErrorLike } from "@application/utils/errors"

function resolveStatus(error: ApplicationError): number {
    if (error instanceof ValidationError) return 400
    if (error instanceof UnauthorizedError) return 401
    if (error instanceof ForbiddenError) return 403
    if (error instanceof NotFoundError) return 404
    if (error instanceof ConflictError) return 409
    if (error instanceof UnprocessableError) return 422
    if (error instanceof InfrastructureError) return 500
    return 400
}

export function mapErrorToHttpResponse(response: Response, unknownError: ErrorLike) {
    const error = ensureError(unknownError)

    if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => ({
            field: issue.path.length > 0 ? issue.path.join(".") : undefined,
            message: issue.message,
        }))
        return response.status(400).json(
            new ValidationError("Invalid request", {
                scope: "validation",
                issues,
            }).toPayload()
        )
    }

    if (error instanceof ApplicationError) {
        return response.status(resolveStatus(error)).json(error.toPayload())
    }

    const fallback = new InfrastructureError()
    return response.status(500).json(fallback.toPayload())
}
