import { Router } from "express";
import { TransactionHttpHandler } from "@express/src/http/TransactionHttpHandler";

export function createTransactionRoutes(transactionHttpHandler: TransactionHttpHandler): Router {
  const router = Router();

  router.post("/transaction", (request, response) =>
    transactionHttpHandler.createTransaction(request, response)
  );
  router.get("/accounts/:accountId/transactions", (request, response) =>
    transactionHttpHandler.getTransactionsByAccount(request, response)
  );
  

  return router;
}
