import { Router } from "express";
import { CreditHttpHandler } from "../http/CreditHttpHandler";


export function createCreditRoutes(creditHttpHandler: CreditHttpHandler): Router {
  const router = Router();

  router.post("/credits/grant", (request, response) =>
    creditHttpHandler.grantCredit(request, response)
  );

  router.get("/credits/:creditId", (request, response) =>
    creditHttpHandler.getCreditById(request, response)
  );

  router.get("/customers/:customerId/credits", (request, response) =>
    creditHttpHandler.getCustomerCredits(request, response)
  );

  router.post("/credits/calculate", (request, response) =>
    creditHttpHandler.calculateCreditDetails(request, response)
  );

  router.post("/credits/simulate-schedule", (request, response) =>
    creditHttpHandler.simulateAmortizationSchedule(request, response)
  );

  router.post("/due-dates/:dueDateId/pay", (request, response) =>
    creditHttpHandler.payInstallment(request, response)
  );

  return router;
}
