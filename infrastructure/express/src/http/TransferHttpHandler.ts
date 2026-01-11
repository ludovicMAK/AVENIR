import { confirmTransfer } from "@application/requests/transfer";
import { CancelTransferRequest } from "@application/usecases/transfer/cancelTransfer";
import { TransferController } from "@express/controllers/TransferController";
import { CreateTransactionSchema } from "@express/schemas/CreateTransactionSchema";
import { ValidateTransferByAdmin } from "@express/schemas/ValidateTransferByAdmin";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import { Request, Response } from "express";
import { UnauthorizedError, ValidationError } from "@application/errors/index";
import { AuthGuard } from "@express/src/http/AuthGuard";

export class TransferHttpHandler {
  constructor(
    private readonly controller: TransferController,
    private readonly authGuard: AuthGuard
  ) {}

  private extractToken(request: Request): string | null {
    const authHeader = request.headers["authorization"];
    if (!authHeader) return null;
    const [scheme, value] = authHeader.split(" ");
    if (scheme?.toLowerCase() === "bearer" && value) return value;
    return authHeader;
  }

  private async getAuthContext(request: Request) {
    const user = await this.authGuard.requireAuthenticated(request);
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }
    return { user, token };
  }

  public async validateTransferByAdmin(request: Request, response: Response) {
    try {
      const { user, token } = await this.getAuthContext(request);
      const { idTransfer } = request.body;

      const parsed = ValidateTransferByAdmin.safeParse({ idTransfer });
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((issue) => issue.message)
          .join(", ");
        throw new Error(issues || "Invalid payload.");
      }

      const input: confirmTransfer = {
        userId: user.id,
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
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async cancelTransfer(request: Request, response: Response) {
    try {
      const { user, token } = await this.getAuthContext(request);
      const { transferId } = request.body;

      if (!transferId) {
        throw new ValidationError("Transfer ID is required");
      }

      const input: CancelTransferRequest = {
        userId: user.id,
        token,
        transferId,
      };

      await this.controller.cancelTransfer(input);

      return sendSuccess(response, {
        status: 200,
        code: "TRANSFER_CANCELLED",
        message: "The transfer has been successfully cancelled.",
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getHistory(request: Request, response: Response) {
    try {
      await this.getAuthContext(request);

      const transfers = await this.controller.getHistory();

      return sendSuccess(response, {
        status: 200,
        code: "TRANSFERS_RETRIEVED",
        message: "Transfer history retrieved successfully.",
        data: transfers,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }
}
