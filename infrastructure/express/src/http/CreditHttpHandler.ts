import { Request, Response } from "express";
import { CreditController } from "@express/controllers/CreditController";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import { ValidationError } from "@application/errors";
import { GrantCreditRequest, PayInstallmentRequest, GetCustomerCreditsWithDueDatesRequest, GetMyCreditsRequest, GetCreditStatusRequest, GetPaymentHistoryRequest, EarlyRepaymentRequest } from "@application/requests/credit";

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

  public async getCustomerCreditsWithDueDates(request: Request, response: Response) {
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

      const getCustomerCreditsWithDueDatesRequest: GetCustomerCreditsWithDueDatesRequest = {
        customerId,
        token: token || "",
        advisorId: userId,
      };

      const creditsWithDueDates = await this.controller.getCustomerCreditsWithDueDates(getCustomerCreditsWithDueDatesRequest);

      return sendSuccess(response, {
        status: 200,
        code: "CREDITS_WITH_DUE_DATES_FOUND",
        message: "Credits with due dates retrieved successfully.",
        data: { creditWithDueDates:creditsWithDueDates },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getMyCredits(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      const getMyCreditsRequest: GetMyCreditsRequest = {
        customerId: userId,
        token: token || "",
      };

      const myCredits = await this.controller.getMyCredits(getMyCreditsRequest);

      return sendSuccess(response, {
        status: 200,
        code: "MY_CREDITS_FOUND",
        message: "My credits retrieved successfully.",
        data: { creditWithDueDates: myCredits },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getCreditStatus(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      const { creditId } = request.params;

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      if (!creditId) {
        throw new ValidationError("Credit ID is required");
      }


      const getCreditStatusRequest: GetCreditStatusRequest = {
        creditId,
        userId,
        token: token || "",
      };

      const creditStatus = await this.controller.getCreditStatus(getCreditStatusRequest);

      return sendSuccess(response, {
        status: 200,
        code: "CREDIT_STATUS_FOUND",
        message: "Credit status retrieved successfully.",
        data: { creditStatusData: creditStatus },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getPaymentHistory(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      const { creditId } = request.params;

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      if (!creditId) {
        throw new ValidationError("Credit ID is required");
      }

      const getPaymentHistoryRequest: GetPaymentHistoryRequest = {
        creditId,
        userId,
        token: token || "",
      };

      const paymentHistory = await this.controller.getPaymentHistory(getPaymentHistoryRequest);

      return sendSuccess(response, {
        status: 200,
        code: "PAYMENT_HISTORY_FOUND",
        message: "Payment history retrieved successfully.",
        data: { payments: paymentHistory },
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

  public async earlyRepayment(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      const { creditId } = request.params;

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      if (!creditId) {
        throw new ValidationError("Credit ID is required");
      }

      const earlyRepaymentRequest: EarlyRepaymentRequest = {
        token: token || "",
        customerId: userId,
        creditId,
      };

      const result = await this.controller.earlyRepayCredit(earlyRepaymentRequest);

      return sendSuccess(response, {
        status: 200,
        code: "CREDIT_REPAID_EARLY",
        message: "Credit repaid early successfully.",
        data: result,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async markOverdueDueDates(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      const result = await this.controller.markOverdueDueDates({ userId, token });

      return sendSuccess(response, {
        status: 200,
        code: "OVERDUE_MARKED",
        message: `Successfully marked ${result.markedCount} due dates as overdue.`,
        data: result,
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getOverdueDueDates(request: Request, response: Response) {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!userId || !token) {
        throw new ValidationError("Authentication required");
      }

      const overdueDueDates = await this.controller.getOverdueDueDates({ userId, token });

      return sendSuccess(response, {
        status: 200,
        code: "OVERDUE_DUE_DATES_RETRIEVED",
        message: "Overdue due dates retrieved successfully.",
        data: { overdueDueDates },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }
} 

