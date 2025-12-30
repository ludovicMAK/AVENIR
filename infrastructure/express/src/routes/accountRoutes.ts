import { Router } from "express";
import { AccountHttpHandler } from "@express/src/http/AccountHttpHandler";

export function createAccountRoutes(
  accountHttpHandler: AccountHttpHandler
): Router {
  const router = Router();

  router.get("/users/:userId/accounts", (request, response) =>
    accountHttpHandler.listByOwnerId(request, response)
  );
  router.get("/accounts/:accountId", (request, response) =>
    accountHttpHandler.getById(request, response)
  );
  router.post("/accounts", (request, response) =>
    accountHttpHandler.create(request, response)
  );
  router.delete("/accounts/:accountId", (request, response) =>
    accountHttpHandler.close(request, response)
  );
  router.patch("/accounts/:accountId/name", (request, response) =>
    accountHttpHandler.updateName(request, response)
  );

  return router;
}
