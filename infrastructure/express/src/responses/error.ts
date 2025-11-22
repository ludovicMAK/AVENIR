import { Response } from "express"
import {
    ApplicationError,
    ConflictError,
    InfrastructureError,
    NotFoundError,
    UnauthorizedError,
    UnprocessableError,
    ValidationError,
} from "@application/errors"
import { ensureError } from "@application/utils/errors"

function resolveStatus(error: ApplicationError): number {
    if (error instanceof ValidationError) return 400
    if (error instanceof UnauthorizedError) return 401
    if (error instanceof NotFoundError) return 404
    if (error instanceof ConflictError) return 409
    if (error instanceof UnprocessableError) return 422
    if (error instanceof InfrastructureError) return 500
    return 400
}

export function mapErrorToHttpResponse(response: Response, unknownError: unknown) {
    const error = ensureError(unknownError)

    if (error instanceof ApplicationError) {
        return response.status(resolveStatus(error)).json(error.toPayload())
    }

    const fallback = new InfrastructureError()
    return response.status(500).json(fallback.toPayload())
}