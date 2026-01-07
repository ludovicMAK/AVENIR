import { Request, Response } from "express";
import { TransactionController } from "@express/controllers/TansactionController";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import { GetTransactionHistoryRequest, TransactionInput } from "@application/requests/transaction";
import { CreateTransactionSchema } from "@express/schemas/CreateTransactionSchema";
import { UnauthorizedError, ValidationError } from "@application/errors";
import { GetAccountTransactionsByAdminRequest } from "@application/usecases/transactions/getAccountTransactionsByAdmin";

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
        
        throw new ValidationError("Données de transaction invalides" + (errorMessages ? ` - ${errorMessages}` : "")
      );
      }

      const { amount, description, accountIBANFrom, accountIBANTo, direction } = result.data;

      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

      if (!userId || !token) {
        throw new UnauthorizedError("Identification manquante (ID ou Token).");
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

      await this.controller.createTransaction(input);

      return sendSuccess(response, {
        status: 201, 
        code: "TRANSACTION_PENDING",
        message: "Transaction registration is pending.",
      });

    } catch (error) {
      console.error("[CreateTransactionHandler] Error:", error);
      return mapErrorToHttpResponse(response, error);
    }
}

public async getTransactionHistory(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      const input: GetTransactionHistoryRequest = {
        userId,
        token,
      };

      const result = await this.controller.getTransactionHistory(input);

      return sendSuccess(response, {
        status: 200,
        code: "TRANSACTION_HISTORY_RETRIEVED",
        message: "Transaction history retrieved successfully.",
        data: result,
      });

    } catch (error) {
      console.error("Get Transaction History Error:", error);
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getAccountTransactionsByAdmin(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      const { iban } = request.params;

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      if (!iban) {
        throw new ValidationError("IBAN is required");
      }

      const input: GetAccountTransactionsByAdminRequest = {
        userId,
        token,
        iban,
      };

      const result = await this.controller.getAccountTransactionsByAdmin(input);

      return sendSuccess(response, {
        status: 200,
        code: "ACCOUNT_TRANSACTIONS_RETRIEVED",
        message: "Account transactions retrieved successfully by admin.",
        data: result,
      });

    } catch (error) {
      console.error("Get Account Transactions By Admin Error:", error);
      return mapErrorToHttpResponse(response, error);
    }
  }
}
