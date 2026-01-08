import { GrantCredit } from "@application/usecases/credits/grantCredit";
import { GetCustomerCreditsWithDueDates } from "@application/usecases/credits/getCustomerCreditsWithDueDates";
import { GetMyCredits } from "@application/usecases/credits/getMyCredits";
import { GetCreditStatus } from "@application/usecases/credits/getCreditStatus";
import { GetPaymentHistory } from "@application/usecases/credits/getPaymentHistory";
import { GetCreditDueDates } from "@application/usecases/credits/getCreditDueDates";
import { EarlyRepayCredit } from "@application/usecases/credits/earlyRepayCredit";
import { MarkOverdueDueDates } from "@application/usecases/credits/markOverdueDueDates";
import { GetOverdueDueDates } from "@application/usecases/credits/getOverdueDueDates";
import { SimulateAmortizationSchedule } from "@application/usecases/credits/simulateAmortizationSchedule";
import { PayInstallment } from "@application/usecases/credits/payInstallment";
import { GrantCreditRequest, GetCustomerCreditsWithDueDatesRequest, GetMyCreditsRequest, GetCreditStatusRequest, GetPaymentHistoryRequest, EarlyRepaymentRequest, CalculateCreditDetailsRequest, PayInstallmentRequest, MarkOverdueRequest, GetOverdueDueDatesRequest } from "@application/requests/credit";
import { CreditWithDueDates } from "@domain/types/CreditWithDueDates";
import { CreditStatusData } from "@domain/types/CreditStatusData";
import { PaymentHistoryItem } from "@domain/types/PaymentHistoryItem";
import { EarlyRepaymentResult } from "@domain/types/EarlyRepaymentResult";
import { MarkOverdueResult } from "@domain/types/MarkOverdueResult";
import { OverdueDueDateWithCredit } from "@domain/types/OverdueDueDateWithCredit";
import { AmortizationSchedule } from "@domain/types/AmortizationSchedule";
import { Credit } from "@domain/entities/credit";
import { DueDate } from "@domain/entities/dueDate";

export class CreditController {
  public constructor(
    private readonly grantCreditUsecase: GrantCredit,
    private readonly getCustomerCreditsWithDueDatesUsecase: GetCustomerCreditsWithDueDates,
    private readonly getMyCreditsUsecase: GetMyCredits,
    private readonly getCreditStatusUsecase: GetCreditStatus,
    private readonly getPaymentHistoryUsecase: GetPaymentHistory,
    private readonly getCreditDueDatesUsecase: GetCreditDueDates,
    private readonly earlyRepayCreditUsecase: EarlyRepayCredit,
    private readonly markOverdueDueDatesUsecase: MarkOverdueDueDates,
    private readonly getOverdueDueDatesUsecase: GetOverdueDueDates,
    private readonly simulateAmortizationScheduleUsecase: SimulateAmortizationSchedule,
    private readonly payInstallmentUsecase: PayInstallment
  ) {}

  public async grantCredit(request: GrantCreditRequest): Promise<Credit> {
    return await this.grantCreditUsecase.execute(request);
  }

  public async getCustomerCreditsWithDueDates(request: GetCustomerCreditsWithDueDatesRequest): Promise<CreditWithDueDates[]> {
    return await this.getCustomerCreditsWithDueDatesUsecase.execute(request);
  }

  public async getMyCredits(request: GetMyCreditsRequest): Promise<CreditWithDueDates[]> {
    return await this.getMyCreditsUsecase.execute(request);
  }

  public async getCreditStatus(request: GetCreditStatusRequest): Promise<CreditStatusData> {
    return await this.getCreditStatusUsecase.execute(request);
  }

  public async getPaymentHistory(request: GetPaymentHistoryRequest): Promise<PaymentHistoryItem[]> {
    return await this.getPaymentHistoryUsecase.execute(request);
  }

  public async getCreditDueDates(request: {creditId: string; userId: string; token: string}): Promise<DueDate[]> {
    return await this.getCreditDueDatesUsecase.execute(request);
  }

  public async earlyRepayCredit(request: EarlyRepaymentRequest): Promise<EarlyRepaymentResult> {
    return await this.earlyRepayCreditUsecase.execute(request);
  }

  public async markOverdueDueDates(request: MarkOverdueRequest): Promise<MarkOverdueResult> {
    return await this.markOverdueDueDatesUsecase.execute(request);
  }

  public async getOverdueDueDates(request: GetOverdueDueDatesRequest): Promise<OverdueDueDateWithCredit[]> {
    return await this.getOverdueDueDatesUsecase.execute(request);
  }

  public simulateAmortizationSchedule(request: CalculateCreditDetailsRequest): AmortizationSchedule {
    return this.simulateAmortizationScheduleUsecase.execute(request);
  }

  public async payInstallment(request: PayInstallmentRequest): Promise<DueDate> {
    return await this.payInstallmentUsecase.execute(request);
  }
}
