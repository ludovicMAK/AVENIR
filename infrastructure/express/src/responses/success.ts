import { Response } from "express";
import { ApplicationSuccess, NoContentSuccess } from "@/application/success";

export function mapSuccessToHttpResponse(res: Response, ok: ApplicationSuccess) {
    if (ok.headers) for (const [k, v] of Object.entries(ok.headers)) res.setHeader(k, v);
    if (ok instanceof NoContentSuccess) return res.status(ok.status).send();
    return res.status(ok.status).json(ok.toPayload());
}