import { Request, Response } from "express";
import { AccountController } from "@express/controllers/AccountController";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";

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
      const accountData = request.body;

      const account = await this.controller.create(accountData);

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
      const { accountId } = request.params;

      if (!accountId) {
        return response.status(400).send({
          code: "MISSING_ACCOUNT_ID",
          message: "L'ID du compte est requis.",
        });
      }

      await this.controller.close(accountId);

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
}
