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
    const userId = request.headers["x-user-id"] as string;
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; 
    const { idTransfer } = request.body;

    const parsed = ValidateTransferByAdmin.safeParse({ idTransfer });
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue) => issue.message)
        .join(", ");
      throw new Error(issues || "Invalid payload.");
    }

    const input: confirmTransfer = {
      userId: userId,
      token: token || "", 
      idTransfer: idTransfer,
    };

    await this.controller.validateTransferByAdmin(input);

    return sendSuccess(response, {
      status: 200,
      code: "TRANSFER_VALIDATED",
      message: "The transfer has been successfully validated and processed.",
    });

  } catch (error) {
    console.error("Validation Error:", error);
    return mapErrorToHttpResponse(response, error);
  }
}
}
