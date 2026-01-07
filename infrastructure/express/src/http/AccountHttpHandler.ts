import { Request, Response } from "express";
import { AccountController } from "@express/controllers/AccountController";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import { ValidationError } from "@application/errors";

export class AccountHttpHandler {
  constructor(private readonly controller: AccountController) {}

  public async listByOwnerId(request: Request, response: Response) {
    try {
      const { userId } = request.params;

      if (!userId) {
        return response.status(400).send({
          code: "MISSING_USER_ID",
          message: "L'ID du propriétaire est requis.",
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
          message: "L'ID du compte est requis.",
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
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      const accountData = request.body;

      const account = await this.controller.create({
        ...accountData,
        idOwner: userId,
        token: token,
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
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;
      if (!accountId) {
        return response.status(400).send({
          code: "MISSING_ACCOUNT_ID",
          message: "L'ID du compte est requis.",
        });
      }
      if (!userId) {
        return response.status(400).send({
          code: "MISSING_USER_ID",
          message: "L'ID de l'utilisateur est requis.",
        });
      }
      if (!token) {
        return response.status(400).send({
          code: "MISSING_AUTH_TOKEN",
          message: "Le token d'authentification est requis.",
        });
      }

      await this.controller.close(accountId, userId, token);

      return sendSuccess(response, {
        status: 200,
        code: "ACCOUNT_CLOSED",
        message: "Account successfully closed.",
        data: undefined,
      });
    } catch (error) {
      console.error("Error in AccountHttpHandler.close:", error);
      return mapErrorToHttpResponse(response, error);
    }
  }
  public async updateName(request: Request, response: Response) {
    try {
      const { accountId } = request.params;
      const { newName } = request.body;
      const userId = request.headers["x-user-id"] as string;

      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (
        !newName ||
        typeof newName !== "string" ||
        newName.trim().length === 0
      ) {
        throw new ValidationError(
          "Le nouveau nom est requis et doit être une chaîne valide."
        );
      }

      if (newName.length > 50) {
        throw new ValidationError(
          "Le nom du compte ne peut pas dépasser 50 caractères."
        );
      }

      await this.controller.updateName(accountId, newName, userId, token);

      return sendSuccess(response, {
        status: 200,
        code: "ACCOUNT_UPDATED",
        message: "Le nom du compte a été mis à jour avec succès.",
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getBalance(request: Request, response: Response) {
    try {
      const { accountId } = request.params;
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!accountId) {
        return response.status(400).send({
          code: "MISSING_ACCOUNT_ID",
          message: "L'ID du compte est requis.",
        });
      }

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      const balanceData = await this.controller.getBalance({
        accountId,
        userId,
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
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!accountId) {
        return response.status(400).send({
          code: "MISSING_ACCOUNT_ID",
          message: "L'ID du compte est requis.",
        });
      }

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      // Récupérer les query params pour les filtres et la pagination
      const { startDate, endDate, direction, status, page, limit } =
        request.query;

      const transactionsData = await this.controller.getTransactions({
        accountId,
        userId,
        token,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        direction: direction as string | undefined,
        status: status as string | undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

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
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!accountId) {
        return response.status(400).send({
          code: "MISSING_ACCOUNT_ID",
          message: "L'ID du compte est requis.",
        });
      }

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      // Récupérer les query params pour les dates
      const { fromDate, toDate } = request.query;

      if (!fromDate || !toDate) {
        return response.status(400).send({
          code: "MISSING_DATES",
          message:
            "Les dates de début (fromDate) et de fin (toDate) sont requises.",
        });
      }

      const statementData = await this.controller.getStatement({
        accountId,
        userId,
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
