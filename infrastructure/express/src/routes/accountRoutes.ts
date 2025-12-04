import { Router } from "express";
import { AccountHttpHandler } from "@express/src/http/AccountHttpHandler";

export function createAccountRoutes(
  accountHttpHandler: AccountHttpHandler
): Router {
  const router = Router();

  router.post("/dashboard", (request, response) =>
    accountHttpHandler.listByOwnerId(request, response)
  );

  return router;
}
