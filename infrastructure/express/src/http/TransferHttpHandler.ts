import { confirmTransfer } from "@application/requests/transfer";
import { TransferController } from "@express/controllers/TransferController";
import { CreateTransactionSchema } from "@express/schemas/CreateTransactionSchema";
import { ValidateTransferByAdmin } from "@express/schemas/ValidateTransferByAdmin";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import { Request, Response } from "express";

export class TransferHttpHandler {
  constructor(private readonly controller: TransferController) {}

    public async validateTransferByAdmin(request: Request, response: Response) {
      try {
        const parsed = ValidateTransferByAdmin.safeParse(request.body);
        if (!parsed.success) {
          const issues = parsed.error.issues
            .map((issue) => issue.message)
            .join(", ");
          throw new Error(issues || "Invalid payload.");
        }
        const input: confirmTransfer = {
          userId: request.body.userId,
          token: request.body.token,
          idTransfer: request.body.idTransfer,
        };
  
        await this.controller.validateTransferByAdmin(input);
  
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
