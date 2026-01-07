import { Request, Response } from "express";
import { TransactionController } from "@express/controllers/TansactionController";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import {
  GetTransactionHistoryRequest,
  TransactionInput,
} from "@application/requests/transaction";
import { CreateTransactionSchema } from "@express/schemas/CreateTransactionSchema";
import { UnauthorizedError, ValidationError } from "@application/errors";
import { GetAccountTransactionsByAdminRequest } from "@application/usecases/transactions/getAccountTransactionsByAdmin";
import { Transaction } from "@domain/entities/transaction";
import { TransactionRepository } from "@application/repositories/transaction";

export class TransactionHttpHandler {
  constructor(
    private readonly controller: TransactionController,
    private readonly transactionRepository: TransactionRepository
  ) {}
  public async createTransaction(request: Request, response: Response) {
    try {
      const result = CreateTransactionSchema.safeParse(request.body);

      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        const errorMessages = Object.entries(fieldErrors)
          .map(([field, messages]) => `${field}: ${messages?.join(", ")}`)
          .join(" | ");

        throw new ValidationError(
          "Données de transaction invalides" +
            (errorMessages ? ` - ${errorMessages}` : "")
        );
      }

      const { amount, description, accountIBANFrom, accountIBANTo, direction } =
        result.data;

      console.log("[CreateTransaction] IBANs received:", {
        accountIBANFrom,
        accountIBANTo,
        fromLength: accountIBANFrom.length,
        toLength: accountIBANTo.length,
      });

      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

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

      // Enrich transactions with counterparty IBAN
      const enrichedTransactions = await Promise.all(
        result.transactions.map(async (t: Transaction) => {
          let counterpartyIBAN: string | undefined;

          if (t.transferId) {
            // Get all transactions for this transfer
            const transferTransactions =
              await this.transactionRepository.getAllTransactionsByTransferId(
                t.transferId
              );
            // Find the other transaction (the one with a different IBAN)
            const otherTransaction = transferTransactions.find(
              (tt) => tt.accountIBAN !== t.accountIBAN
            );
            counterpartyIBAN = otherTransaction?.accountIBAN;
          }

          return {
            id: t.id,
            accountIBAN: t.accountIBAN,
            transactionDirection: t.transactionDirection.getValue(),
            amount: t.amount,
            reason: t.reason,
            accountDate: t.accountDate,
            status: t.status.getValue(),
            transferId: t.transferId,
            counterpartyIBAN,
          };
        })
      );

      return sendSuccess(response, {
        status: 200,
        code: "TRANSACTION_HISTORY_RETRIEVED",
        message: "Transaction history retrieved successfully.",
        data: { transactions: enrichedTransactions },
      });
    } catch (error) {
      console.error("Get Transaction History Error:", error);
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getAccountTransactionsByAdmin(
    request: Request,
    response: Response
  ) {
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
