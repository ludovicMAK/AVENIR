import { GrantCredit } from "@application/usecases/credits/grantCredit";
import { GetCreditById } from "@application/usecases/credits/getCreditById";
import { GetCustomerCredits } from "@application/usecases/credits/getCustomerCredits";
import { CalculateCreditDetails, CreditDetails } from "@application/usecases/credits/calculateCreditDetails";
import { SimulateAmortizationSchedule, AmortizationSchedule } from "@application/usecases/credits/simulateAmortizationSchedule";
import { PayInstallment } from "@application/usecases/credits/payInstallment";
import { GrantCreditRequest, GetCreditByIdRequest, GetCustomerCreditsRequest, CalculateCreditDetailsRequest, PayInstallmentRequest } from "@application/requests/credit";
import { Credit } from "@domain/entities/credit";
import { DueDate } from "@domain/entities/dueDate";

export class CreditController {
  public constructor(
    private readonly grantCreditUsecase: GrantCredit,
    private readonly getCreditByIdUsecase: GetCreditById,
    private readonly getCustomerCreditsUsecase: GetCustomerCredits,
    private readonly calculateCreditDetailsUsecase: CalculateCreditDetails,
    private readonly simulateAmortizationScheduleUsecase: SimulateAmortizationSchedule,
    private readonly payInstallmentUsecase: PayInstallment
  ) {}

  public async grantCredit(request: GrantCreditRequest): Promise<Credit> {
    return await this.grantCreditUsecase.execute(request);
  }

  public async getCreditById(request: GetCreditByIdRequest, userId: string): Promise<Credit> {
    return await this.getCreditByIdUsecase.execute(request, userId);
  }

  public async getCustomerCredits(request: GetCustomerCreditsRequest): Promise<Credit[]> {
    return await this.getCustomerCreditsUsecase.execute(request);
  }

  public async calculateCreditDetails(request: CalculateCreditDetailsRequest): Promise<CreditDetails> {
    return this.calculateCreditDetailsUsecase.execute(request);
  }

  public simulateAmortizationSchedule(request: CalculateCreditDetailsRequest): AmortizationSchedule {
    return this.simulateAmortizationScheduleUsecase.execute(request);
  }

  public async payInstallment(request: PayInstallmentRequest): Promise<DueDate> {
    return await this.payInstallmentUsecase.execute(request);
  }
}
