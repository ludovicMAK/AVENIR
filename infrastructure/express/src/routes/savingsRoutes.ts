import { Router } from "express";
import { SavingsHttpHandler } from "@express/src/http/SavingsHttpHandler";

export function createSavingsRoutes(
  savingsHttpHandler: SavingsHttpHandler
): Router {
  const router = Router();

  router.post("/savings/rates", (request, response) =>
    savingsHttpHandler.updateRate(request, response)
  );

  router.get("/savings/rates/history", (request, response) =>
    savingsHttpHandler.history(request, response)
  );

  router.get("/savings/rates/active", (request, response) =>
    savingsHttpHandler.activeRate(request, response)
  );

  router.post("/savings/interests/process", (request, response) =>
    savingsHttpHandler.processDailyInterest(request, response)
  );

  router.get("/accounts/:accountId/interests", (request, response) =>
    savingsHttpHandler.accountInterestHistory(request, response)
  );

  return router;
}
