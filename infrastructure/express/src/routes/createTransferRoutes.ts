import { Router } from "express";
import { TransferHttpHandler } from "../http/TransferHttpHandler";

export function createTransferRoutes(
  transferHttpHandler: TransferHttpHandler
): Router {
  const router = Router();

  router.patch("/transfers/validate", (request, response) =>
    transferHttpHandler.validateTransferByAdmin(request, response)
  );

  router.patch("/transfers/cancel", (request, response) =>
    transferHttpHandler.cancelTransfer(request, response)
  );

  return router;
}
