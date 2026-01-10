import { Request, Response } from "express";
import { AccountController } from "@express/controllers/AccountController";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import { ValidationError, UnauthorizedError } from "@application/errors";
import { Transaction } from "@domain/entities/transaction";
import { TransactionRepository } from "@application/repositories/transaction";
import { AuthGuard } from "@express/src/http/AuthGuard";

export class AccountHttpHandler {
  constructor(
    private readonly controller: AccountController,
    private readonly transactionRepository: TransactionRepository,
    private readonly authGuard: AuthGuard
  ) {}

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization as string;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    return token ?? null;
  }

  public async listByOwnerId(request: Request, response: Response) {
    try {
      const { userId } = request.params;

      if (!userId) {
        return response.status(400).send({
          code: "MISSING_USER_ID",
          message: "Owner ID is required.",
        });
      }

      const accounts = await this.controller.listByOwnerId(userId);

      return sendSuccess(response, {
        status: 200,
        code: "ACCOUNTS_RETRIEVED",
        message: "Accounts successfully retrieved.",
        data: { accounts },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getById(request: Request, response: Response) {
    try {
      const { accountId } = request.params;

      if (!accountId) {
        return response.status(400).send({
          code: "MISSING_ACCOUNT_ID",
          message: "Account ID is required.",
        });
      }

      const account = await this.controller.getById(accountId);

      return sendSuccess(response, {
        status: 200,
        code: "ACCOUNT_RETRIEVED",
        message: "Account successfully retrieved.",
        data: { account },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async create(request: Request, response: Response) {
    try {
      const user = await this.authGuard.requireAuthenticated(request);
      const token = this.extractToken(request);
      if (!token) {
        throw new UnauthorizedError("Authentication required");
      }

      const accountData = request.body;

      const account = await this.controller.create({
        ...accountData,
        idOwner: user.id,
        token,
      });

      return sendSuccess(response, {
        status: 201,
        code: "ACCOUNT_CREATED",
        message: "Account successfully created.",
        data: { account },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async close(request: Request, response: Response) {
    try {
      const accountId = request.params.accountId;
      const user = await this.authGuard.requireAuthenticated(request);
      const token = this.extractToken(request);
      if (!accountId) {
        return response.status(400).send({
          code: "MISSING_ACCOUNT_ID",
          message: "Account ID is required.",
        });
      }
      if (!token) {
        return response.status(400).send({
          code: "MISSING_AUTH_TOKEN",
          message: "Authentication token is required.",
        });
      }

      await this.controller.close(accountId, user.id, token);

      return sendSuccess(response, {
        status: 200,
        code: "ACCOUNT_CLOSED",
        message: "Account successfully closed.",
        data: undefined,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }
  public async updateName(request: Request, response: Response) {
    try {
      const { accountId } = request.params;
      const { newName } = request.body;
      const user = await this.authGuard.requireAuthenticated(request);
      const token = this.extractToken(request);

      if (
        !newName ||
        typeof newName !== "string" ||
        newName.trim().length === 0
      ) {
        throw new ValidationError(
          "A new name is required and must be a valid string."
        );
      }

      if (newName.length > 50) {
        throw new ValidationError(
          "The account name cannot exceed 50 characters."
        );
      }

      await this.controller.updateName(accountId, newName, user.id, token ?? "");

      return sendSuccess(response, {
        status: 200,
        code: "ACCOUNT_UPDATED",
        message: "Account name updated successfully.",
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getBalance(request: Request, response: Response) {
    try {
      const { accountId } = request.params;
      const user = await this.authGuard.requireAuthenticated(request);
      const token = this.extractToken(request);

      if (!accountId) {
        return response.status(400).send({
          code: "MISSING_ACCOUNT_ID",
          message: "Account ID is required.",
        });
      }

      if (!user.id || !token) {
        throw new ValidationError("Authentication required");
      }

      const balanceData = await this.controller.getBalance({
        accountId,
        userId: user.id,
        token,
      });

      return sendSuccess(response, {
        status: 200,
        code: "BALANCE_RETRIEVED",
        message: "Account balance successfully retrieved.",
        data: balanceData,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getTransactions(request: Request, response: Response) {
    try {
      const { accountId } = request.params;
      const user = await this.authGuard.requireAuthenticated(request);
      const token = this.extractToken(request);

      if (!accountId) {
        return response.status(400).send({
          code: "MISSING_ACCOUNT_ID",
          message: "Account ID is required.",
        });
      }

      if (!user.id || !token) {
        throw new ValidationError("Authentication required");
      }

      const { startDate, endDate, direction, status, page, limit } =
        request.query;

      const result = await this.controller.getTransactions({
        accountId,
        userId: user.id,
        token,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        direction: direction as string | undefined,
        status: status as string | undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      const enrichedTransactions = await Promise.all(
        result.transactions.map(async (t: Transaction) => {
          let counterpartyIBAN: string | undefined;

          if (t.transferId) {
            const transferTransactions =
              await this.transactionRepository.getAllTransactionsByTransferId(
                t.transferId
              );
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

      const transactionsData = {
        transactions: enrichedTransactions,
        pagination: {
          page: result.page,
          limit: limit ? parseInt(limit as string, 10) : 20,
          total: result.total,
          totalPages: result.totalPages,
        },
      };

      return sendSuccess(response, {
        status: 200,
        code: "TRANSACTIONS_RETRIEVED",
        message: "Account transactions successfully retrieved.",
        data: transactionsData,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getStatement(request: Request, response: Response) {
    try {
      const { accountId } = request.params;
      const user = await this.authGuard.requireAuthenticated(request);
      const token = this.extractToken(request);

      if (!accountId) {
        return response.status(400).send({
          code: "MISSING_ACCOUNT_ID",
          message: "Account ID is required.",
        });
      }

      if (!user.id || !token) {
        throw new ValidationError("Authentication required");
      }

      const { fromDate, toDate } = request.query;

      if (!fromDate || !toDate) {
        return response.status(400).send({
          code: "MISSING_DATES",
          message:
            "Start date (fromDate) and end date (toDate) are required.",
        });
      }

      const statementData = await this.controller.getStatement({
        accountId,
        userId: user.id,
        token,
        fromDate: fromDate as string,
        toDate: toDate as string,
      });

      return sendSuccess(response, {
        status: 200,
        code: "STATEMENT_RETRIEVED",
        message: "Account statement successfully retrieved.",
        data: statementData,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }
}
