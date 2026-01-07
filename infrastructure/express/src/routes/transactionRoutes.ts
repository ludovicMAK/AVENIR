import { Router } from "express";
import { TransactionHttpHandler } from "@express/src/http/TransactionHttpHandler";

export function createTransactionRoutes(transactionHttpHandler: TransactionHttpHandler): Router {
  const router = Router();

  router.post("/transaction", (request, response) =>
    transactionHttpHandler.createTransaction(request, response)
  );
  
  router.get("/transactions/history", (request, response) =>
    transactionHttpHandler.getTransactionHistory(request, response)
  );

  router.get("/transactions/account/:iban", (request, response) =>
    transactionHttpHandler.getAccountTransactionsByAdmin(request, response)
  );
  
  return router;
}
