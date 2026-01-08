import { Request, Response } from "express";
import { CreditController } from "@express/controllers/CreditController";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import { ValidationError } from "@application/errors";
import { GrantCreditRequest, PayInstallmentRequest, GetCustomerCreditsWithDueDatesRequest, GetMyCreditsRequest, GetCreditStatusRequest, GetPaymentHistoryRequest, EarlyRepaymentRequest } from "@application/requests/credit";
import { CreditsWithDueDatesResponseData, SerializedCreditsWithDueDatesData, SerializedCreditWithDueDates, DueDatesResponseData } from "@express/types/responses";

export class CreditHttpHandler {
  constructor(private readonly controller: CreditController) {}

  private serializeCreditWithDueDates(creditWithDueDates: any): SerializedCreditWithDueDates {
    const credit = creditWithDueDates.credit;
    const dueDates = creditWithDueDates.dueDates;
    
    // Calculer les montants depuis les méthodes et les due dates
    const monthlyPayment = credit.getMonthlyPayment();
    const totalAmountDue = credit.getTotalAmountToPay();
    
    // Calculer le montant total payé depuis les due dates
    const totalPaid = dueDates
      .filter((dd: any) => dd.isPaid())
      .reduce((sum: number, dd: any) => sum + Number(dd.totalAmount), 0);
    
    const remainingAmount = totalAmountDue - totalPaid;
    
    return {
      id: credit.id,
      customerId: credit.customerId,
      advisorId: '', // Non disponible dans l'entité Credit
      accountId: '', // Non disponible dans l'entité Credit
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

  public async getCreditDueDates(request: Request, response: Response) {
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

      const dueDates = await this.controller.getCreditDueDates({
        creditId,
        userId,
        token: token || "",
      });

      // Sérialiser les dueDates
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

