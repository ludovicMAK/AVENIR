import { Response } from "express";
import { SuccessOptions, SuccessPayload } from "@express/types/responses";

export function sendSuccess<ResponseData = SuccessPayload["data"]>(
  response: Response,
  options: SuccessOptions<ResponseData>
) {
  const { status = 200, code, message, data, headers } = options;

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      response.setHeader(key, value);
    }
  }

  const payload: SuccessPayload<ResponseData> = { status, code };
  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;

  return response.status(status).json(payload);
}
