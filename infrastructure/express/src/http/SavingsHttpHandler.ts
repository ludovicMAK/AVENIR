import { Request, Response } from "express";
import { SavingsController } from "@express/controllers/SavingsController";
import { mapErrorToHttpResponse } from "../responses/error";
import { sendSuccess } from "../responses/success";
import { ValidationError } from "@application/errors";
import {
  toDailyInterestDto,
  toSavingsRateDto,
} from "../mappers/savings";
import {
  AuthenticateUser,
  AuthenticateUserRequest,
} from "@application/usecases/auth/authenticateUser";

export class SavingsHttpHandler {
  constructor(
    private readonly controller: SavingsController,
    private readonly authenticateUser: AuthenticateUser
  ) {}

  private extractAuth(request: Request): AuthenticateUserRequest {
    const authHeader = request.headers.authorization as string;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    const userId = request.headers["x-user-id"] as string;
    return { userId, token };
  }

  private async authenticate(request: Request) {
    return this.authenticateUser.execute(this.extractAuth(request));
  }

  async updateRate(request: Request, response: Response) {
    try {
      const user = await this.authenticate(request);
      const { rate, dateEffect } = request.body;

      if (rate === undefined) {
        throw new ValidationError("Rate is required.");
      }

      const result = await this.controller.updateRate({
        rate: Number(rate),
        dateEffect,
        actorRole: user.role,
      });

      return sendSuccess(response, {
        status: 201,
        code: "SAVINGS_RATE_UPDATED",
        message: "Savings rate updated.",
        data: { rate: toSavingsRateDto(result) },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async history(request: Request, response: Response) {
    try {
      await this.authenticate(request);
      const rates = await this.controller.history();

      return sendSuccess(response, {
        status: 200,
        code: "SAVINGS_RATE_HISTORY",
        message: "Savings rate history retrieved.",
        data: { rates: rates.map(toSavingsRateDto) },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async activeRate(request: Request, response: Response) {
    try {
      await this.authenticate(request);
      const { date } = request.query;
      const rate = await this.controller.activeRate({
        date: date as string | undefined,
      });

      return sendSuccess(response, {
        status: 200,
        code: "ACTIVE_SAVINGS_RATE",
        message: "Active savings rate retrieved.",
        data: { rate: toSavingsRateDto(rate) },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async processDailyInterest(request: Request, response: Response) {
    try {
      const user = await this.authenticate(request);
      const { date } = request.body;

      const result = await this.controller.processDailyInterest({
        date,
        actorRole: user.role,
      });

      return sendSuccess(response, {
        status: 200,
        code: "SAVINGS_INTEREST_PROCESSED",
        message: "Daily interests calculated and credited.",
        data: result,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  async accountInterestHistory(request: Request, response: Response) {
    try {
      const user = await this.authenticate(request);
      const { accountId } = request.params;
      const { from, to } = request.query;

      const interests = await this.controller.getAccountInterestHistory({
        userId: user.id,
        accountId,
        from: from as string | undefined,
        to: to as string | undefined,
      });

      return sendSuccess(response, {
        status: 200,
        code: "ACCOUNT_INTEREST_HISTORY",
        message: "Account interests history retrieved.",
        data: { interests: interests.map(toDailyInterestDto) },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }
}
