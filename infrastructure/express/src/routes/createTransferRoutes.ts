import { Router } from "express";
import { TransferHttpHandler } from "../http/TransferHttpHandler";

export function createTransferRoutes(
  transferHttpHandler: TransferHttpHandler
): Router {
  const router = Router();

  router.post("/transfers/validate", (request, response) =>
    transferHttpHandler.validateTransferByAdmin(request, response)
  );
  

  return router;
}
