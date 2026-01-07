import { GrantCredit } from "@application/usecases/credits/grantCredit";
import { GetCustomerCreditsWithDueDates, CreditWithDueDates } from "@application/usecases/credits/getCustomerCreditsWithDueDates";
import { GetMyCredits } from "@application/usecases/credits/getMyCredits";
import { GetCreditStatus, CreditStatusData } from "@application/usecases/credits/getCreditStatus";
import { SimulateAmortizationSchedule, AmortizationSchedule } from "@application/usecases/credits/simulateAmortizationSchedule";
import { PayInstallment } from "@application/usecases/credits/payInstallment";
import { GrantCreditRequest, GetCustomerCreditsWithDueDatesRequest, GetMyCreditsRequest, GetCreditStatusRequest, CalculateCreditDetailsRequest, PayInstallmentRequest } from "@application/requests/credit";
import { Credit } from "@domain/entities/credit";
import { DueDate } from "@domain/entities/dueDate";

export class CreditController {
  public constructor(
    private readonly grantCreditUsecase: GrantCredit,
    private readonly getCustomerCreditsWithDueDatesUsecase: GetCustomerCreditsWithDueDates,
    private readonly getMyCreditsUsecase: GetMyCredits,
    private readonly getCreditStatusUsecase: GetCreditStatus,
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

  public simulateAmortizationSchedule(request: CalculateCreditDetailsRequest): AmortizationSchedule {
    return this.simulateAmortizationScheduleUsecase.execute(request);
  }

  public async payInstallment(request: PayInstallmentRequest): Promise<DueDate> {
    return await this.payInstallmentUsecase.execute(request);
  }
}
