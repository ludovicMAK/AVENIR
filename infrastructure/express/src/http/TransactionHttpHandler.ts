import { Request, Response } from "express";
import { TransactionController } from "@express/controllers/TansactionController";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import { TransactionInput } from "@application/requests/transaction";
import { CreateTransactionSchema } from "@express/schemas/CreateTransactionSchema";

export class TransactionHttpHandler {
  constructor(private readonly controller: TransactionController) {}
  public async createTransaction(request: Request, response: Response) {
    try {
      const parsed = CreateTransactionSchema.safeParse(request.body);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((issue) => issue.message)
          .join(", ");
        throw new Error(issues || "Invalid payload.");
      }
      const input: TransactionInput = {
        description: request.body.description,
        amount: request.body.amount,
        accountIBANFrom: request.body.accountIBANFrom,
        accountIBANTo: request.body.accountIBANTo,
        direction: request.body.direction,
        dateExecuted: new Date(request.body.dateExecuted),
      };

      await this.controller.createTransaction(input);

      return sendSuccess(response, {
        status: 200,
        code: "TRANSACTION_PENDING",
        message: "Transaction registration is pending.",
      });
    } catch (error) {
      console.log(error);
      return mapErrorToHttpResponse(response, error);
    }
  }
}
