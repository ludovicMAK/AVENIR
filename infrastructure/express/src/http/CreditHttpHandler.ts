import { Request, Response } from "express";
import { CreditController } from "@express/controllers/CreditController";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import { ValidationError } from "@application/errors";
import { GrantCreditRequest, CalculateCreditDetailsRequest, PayInstallmentRequest } from "@application/requests/credit";

export class CreditHttpHandler {
  constructor(private readonly controller: CreditController) {}

  public async grantCredit(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      const { customerId, accountId, amountBorrowed, annualRate, insuranceRate, durationInMonths } = request.body;

      if (!customerId || !accountId || !amountBorrowed || !annualRate || !insuranceRate || !durationInMonths) {
        throw new ValidationError("Missing required fields: customerId, accountId, amountBorrowed, annualRate, insuranceRate, durationInMonths");
      }

      const grantCreditRequest: GrantCreditRequest = {
        token: token || "",
        customerId,
        accountId,
        amountBorrowed,
        annualRate,
        insuranceRate,
        durationInMonths,
        advisorId: userId,
      };

      const credit = await this.controller.grantCredit(grantCreditRequest);

      return sendSuccess(response, {
        status: 201,
        code: "CREDIT_GRANTED",
        message: "Credit granted successfully.",
        data: { credit },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getCreditById(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      const { creditId } = request.params;

      if (!creditId) {
        throw new ValidationError("Credit ID is required");
      }

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      const credit = await this.controller.getCreditById(
        { creditId, token: token || "" },
        userId
      );

      return sendSuccess(response, {
        status: 200,
        code: "CREDIT_FOUND",
        message: "Credit retrieved successfully.",
        data: { credit },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getCustomerCredits(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      const { customerId } = request.params;

      if (!customerId) {
        throw new ValidationError("Customer ID is required");
      }

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      const credits = await this.controller.getCustomerCredits({
        customerId,
        token: token || "",
        advisorId: userId,
      });

      return sendSuccess(response, {
        status: 200,
        code: "CREDITS_FOUND",
        message: "Credits retrieved successfully.",
        data: { credits },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async calculateCreditDetails(request: Request, response: Response) {
    try {
      const { amountBorrowed, annualRate, insuranceRate, durationInMonths } = request.body;

      if (!amountBorrowed || !annualRate || !insuranceRate || !durationInMonths) {
        throw new ValidationError("Missing required fields: amountBorrowed, annualRate, insuranceRate, durationInMonths");
      }

      const details = await this.controller.calculateCreditDetails({
        amountBorrowed,
        annualRate,
        insuranceRate,
        durationInMonths,
      });

      return sendSuccess(response, {
        status: 200,
        code: "CREDIT_DETAILS_CALCULATED",
        message: "Credit details calculated successfully.",
        data: { details },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public simulateAmortizationSchedule(request: Request, response: Response) {
    try {
      const { amountBorrowed, annualRate, insuranceRate, durationInMonths } = request.body;

      if (!amountBorrowed || !annualRate || !insuranceRate || !durationInMonths) {
        throw new ValidationError("Missing required fields: amountBorrowed, annualRate, insuranceRate, durationInMonths");
      }

      const schedule = this.controller.simulateAmortizationSchedule({
        amountBorrowed,
        annualRate,
        insuranceRate,
        durationInMonths,
      });

      return sendSuccess(response, {
        status: 200,
        code: "AMORTIZATION_SCHEDULE_SIMULATED",
        message: "Amortization schedule simulated successfully.",
        data: { schedule },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async payInstallment(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      const { dueDateId } = request.params;

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      if (!dueDateId) {
        throw new ValidationError("Due date ID is required");
      }

      const payInstallmentRequest: PayInstallmentRequest = {
        token: token || "",
        customerId: userId,
        dueDateId,
      };

      const paidDueDate = await this.controller.payInstallment(payInstallmentRequest);

      return sendSuccess(response, {
        status: 200,
        code: "INSTALLMENT_PAID",
        message: "Installment paid successfully.",
        data: { dueDate: paidDueDate },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }
} 
