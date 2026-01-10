import { Request, Response } from "express";
import { CreditController } from "@express/controllers/CreditController";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import { ValidationError, UnauthorizedError } from "@application/errors";
import { GrantCreditRequest, PayInstallmentRequest, GetCustomerCreditsWithDueDatesRequest, GetMyCreditsRequest, GetCreditStatusRequest, GetPaymentHistoryRequest, EarlyRepaymentRequest } from "@application/requests/credit";
import { CreditsWithDueDatesResponseData, SerializedCreditsWithDueDatesData, SerializedCreditWithDueDates, DueDatesResponseData } from "@express/types/responses";
import { AuthGuard } from "@express/src/http/AuthGuard";

export class CreditHttpHandler {
  constructor(
    private readonly controller: CreditController,
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

  private serializeCreditWithDueDates(creditWithDueDates: any): SerializedCreditWithDueDates {
    const credit = creditWithDueDates.credit;
    const dueDates = creditWithDueDates.dueDates;

    const monthlyPayment = credit.getMonthlyPayment();
    const totalAmountDue = credit.getTotalAmountToPay();

    const totalPaid = dueDates
      .filter((dd: any) => dd.isPaid())
      .reduce((sum: number, dd: any) => sum + Number(dd.totalAmount), 0);
    
    const remainingAmount = totalAmountDue - totalPaid;
    
    return {
      id: credit.id,
      customerId: credit.customerId,
      advisorId: '',
      accountId: '',
      amountBorrowed: credit.amountBorrowed,
      annualRate: credit.annualRate,
      insuranceRate: credit.insuranceRate,
      durationInMonths: credit.durationInMonths,
      monthlyPayment,
      status: typeof credit.status === 'string' ? credit.status : credit.status.getValue(),
      dateGranted: credit.startDate,
      totalAmountDue,
      totalPaid,
      remainingAmount,
      dueDates: dueDates.map((dd: any) => ({
        id: dd.id,
        creditId: dd.creditId,
        dueDate: dd.dueDate,
        amountDue: dd.totalAmount,
        principal: dd.repaymentPortion,
        interest: dd.shareInterest,
        insurance: dd.shareInsurance,
        status: typeof dd.status === 'string' ? dd.status : dd.status.getValue(),
        paidDate: dd.paymentDate,
        paidAmount: dd.totalAmount,
      })),
    };
  }

  public async grantCredit(request: Request, response: Response) {
    try {
      const { user, token } = await this.getAuthContext(request);

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
        advisorId: user.id,
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
      const { user, token } = await this.getAuthContext(request);
      const { customerId } = request.params;

      if (!customerId) {
        throw new ValidationError("Customer ID is required");
      }

      const getCustomerCreditsWithDueDatesRequest: GetCustomerCreditsWithDueDatesRequest = {
        customerId,
        token: token || "",
        advisorId: user.id,
      };

      const creditsWithDueDates = await this.controller.getCustomerCreditsWithDueDates(getCustomerCreditsWithDueDatesRequest);
      const serializedCredits = creditsWithDueDates.map((c) => this.serializeCreditWithDueDates(c));

      return sendSuccess<SerializedCreditsWithDueDatesData>(response, {
        status: 200,
        code: "CREDITS_WITH_DUE_DATES_FOUND",
        message: "Credits with due dates retrieved successfully.",
        data: { creditWithDueDates: serializedCredits },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getMyCredits(request: Request, response: Response) {
    try {
      const { user, token } = await this.getAuthContext(request);

      const getMyCreditsRequest: GetMyCreditsRequest = {
        customerId: user.id,
        token: token || "",
      };

      const myCredits = await this.controller.getMyCredits(getMyCreditsRequest);
      const serializedCredits = myCredits.map((c) => this.serializeCreditWithDueDates(c));

      return sendSuccess<CreditsWithDueDatesResponseData>(response, {
        status: 200,
        code: "MY_CREDITS_FOUND",
        message: "My credits retrieved successfully.",
        data: { credits: serializedCredits },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getCreditStatus(request: Request, response: Response) {
    try {
      const { user, token } = await this.getAuthContext(request);
      const { creditId } = request.params;

      if (!creditId) {
        throw new ValidationError("Credit ID is required");
      }


      const getCreditStatusRequest: GetCreditStatusRequest = {
        creditId,
        userId: user.id,
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
      const { user, token } = await this.getAuthContext(request);
      const { creditId } = request.params;

      if (!creditId) {
        throw new ValidationError("Credit ID is required");
      }

      const getPaymentHistoryRequest: GetPaymentHistoryRequest = {
        creditId,
        userId: user.id,
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

  public async getCreditDueDates(request: Request, response: Response) {
    try {
      const { user, token } = await this.getAuthContext(request);
      const { creditId } = request.params;

      if (!creditId) {
        throw new ValidationError("Credit ID is required");
      }

      const dueDates = await this.controller.getCreditDueDates({
        creditId,
        userId: user.id,
        token: token || "",
      });

      const serializedDueDates = dueDates.map((dd) => ({
        id: dd.id,
        creditId: dd.creditId,
        dueDate: dd.dueDate,
        amountDue: dd.totalAmount,
        principal: dd.repaymentPortion,
        interest: dd.shareInterest,
        insurance: dd.shareInsurance,
        status: typeof dd.status === 'string' ? dd.status : dd.status.getValue(),
        paidDate: dd.paymentDate,
        paidAmount: dd.totalAmount,
      }));

      return sendSuccess<DueDatesResponseData>(response, {
        status: 200,
        code: "DUE_DATES_FOUND",
        message: "Due dates retrieved successfully.",
        data: { dueDates: serializedDueDates },
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
      const { user, token } = await this.getAuthContext(request);
      const { dueDateId } = request.params;

      if (!dueDateId) {
        throw new ValidationError("Due date ID is required");
      }

      const payInstallmentRequest: PayInstallmentRequest = {
        token: token || "",
        customerId: user.id,
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
      const { user, token } = await this.getAuthContext(request);
      const { creditId } = request.params;

      if (!creditId) {
        throw new ValidationError("Credit ID is required");
      }

      const earlyRepaymentRequest: EarlyRepaymentRequest = {
        token: token || "",
        customerId: user.id,
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
      const { user, token } = await this.getAuthContext(request);

      const result = await this.controller.markOverdueDueDates({ userId: user.id, token });

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
      const { user, token } = await this.getAuthContext(request);

      const overdueDueDates = await this.controller.getOverdueDueDates({ userId: user.id, token });

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
