import { Request, Response } from "express";
import { TransactionController } from "@express/controllers/TransactionController";
import { mapErrorToHttpResponse } from "../responses/error";
import { TransactionInput } from "@application/requests/transaction";
import { CreateTransactionSchema } from "@express/schemas/CreateTransactionSchema";
import { UnauthorizedError, ValidationError } from "@application/errors";

export class TransactionHttpHandler {
  constructor(private readonly controller: TransactionController) {}
  public async createTransaction(request: Request, response: Response) {
    try {
      const result = CreateTransactionSchema.safeParse(request.body);
      
     if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        const errorMessages = Object.entries(fieldErrors)
          .map(([field, messages]) => `${field}: ${messages?.join(", ")}`)
          .join(" | ");
        
        throw new ValidationError("Invalid transaction data" + (errorMessages ? ` - ${errorMessages}` : "")
      );
      }

      const { amount, description, accountIBANFrom, accountIBANTo, direction } = result.data;

      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

      if (!userId) {
        throw new UnauthorizedError("Missing userId header.");
      }
      if (!token) {
        throw new UnauthorizedError("Missing authorization token.");
      }

      const input: TransactionInput = {
        idUser: userId,
        token: token,
        description,
        amount,
        accountIBANFrom,
        accountIBANTo,
        direction,
        dateExecuted: new Date(),
      };

      const transferId = await this.controller.createTransaction(input);

      return response.status(201).json({
        ok: true,
        code: "TRANSACTION_PENDING",
        message: "Transaction registration is pending.",
        transferId,
      });

    } catch (error) {
      console.error("[CreateTransactionHandler] Error:", error);
      return mapErrorToHttpResponse(response, error);
    }
}

  public async getTransactionsByAccount(request: Request, response: Response) {
    try {
      const accountId = request.params.accountId;
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!accountId) {
        throw new ValidationError("Account identifier is required.");
      }
      if (!userId) {
        throw new UnauthorizedError("Missing userId header.");
      }
      if (!token) {
        throw new UnauthorizedError("Missing authorization token.");
      }

      const transactions = await this.controller.getTransactionsByAccount({
        accountId,
        userId,
        token,
      });

      return response.status(200).json({
        ok: true,
        code: "TRANSACTION_HISTORY",
        message: "Transactions successfully retrieved.",
        transactions,
      });
    } catch (error) {
      console.error("[GetTransactionsByAccountHandler] Error:", error);
      return mapErrorToHttpResponse(response, error);
    }
  }
}
