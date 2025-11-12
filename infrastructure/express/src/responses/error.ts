import { Response } from "express";
import { ApplicationError, InfrastructureError } from "@/application/errors";

export function mapErrorToHttpResponse(res: Response, err: unknown) {
    if (err instanceof ApplicationError) {
        if (err.headers) for (const [k, v] of Object.entries(err.headers)) res.setHeader(k, v);
        if (err.status === 204) return res.status(204).send();
        return res.status(err.status).json(err.toPayload());
    }
    const fallback = new InfrastructureError();
    return res.status(fallback.status).json(fallback.toPayload());
}