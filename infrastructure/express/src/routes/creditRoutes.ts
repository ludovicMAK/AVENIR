import { Router } from "express";
import { CreditHttpHandler } from "../http/CreditHttpHandler";


export function createCreditRoutes(creditHttpHandler: CreditHttpHandler): Router {
  const router = Router();

  router.post("/credits/grant", (request, response) =>
    creditHttpHandler.grantCredit(request, response)
  );

  router.get("/credits/:customerId/credits-with-due-dates", (request, response) =>
    creditHttpHandler.getCustomerCreditsWithDueDates(request, response)
  );

  router.get("/my-credits", (request, response) =>
    creditHttpHandler.getMyCredits(request, response)
  );

  router.get("/credits/:creditId/status", (request, response) =>
    creditHttpHandler.getCreditStatus(request, response)
  );

  router.get("/credits/:creditId/payment-history", (request, response) =>
    creditHttpHandler.getPaymentHistory(request, response)
  );

  router.post("/credits/simulate-schedule", (request, response) =>
    creditHttpHandler.simulateAmortizationSchedule(request, response)
  );

  router.post("/due-dates/:dueDateId/pay", (request, response) =>
    creditHttpHandler.payInstallment(request, response)
  );

  router.post("/credits/:creditId/early-repayment", (request, response) =>
    creditHttpHandler.earlyRepayment(request, response)
  );

  router.post("/credits/mark-overdue", (request, response) =>
    creditHttpHandler.markOverdueDueDates(request, response)
  );

  router.get("/credits/overdue", (request, response) =>
    creditHttpHandler.getOverdueDueDates(request, response)
  );


  return router;
}
