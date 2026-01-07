import { GrantCredit } from "@application/usecases/credits/grantCredit";
import { GetCreditById } from "@application/usecases/credits/getCreditById";
import { GetCustomerCreditsWithDueDates, CreditWithDueDates } from "@application/usecases/credits/getCustomerCreditsWithDueDates";
import { SimulateAmortizationSchedule, AmortizationSchedule } from "@application/usecases/credits/simulateAmortizationSchedule";
import { PayInstallment } from "@application/usecases/credits/payInstallment";
import { GrantCreditRequest, GetCreditByIdRequest, GetCustomerCreditsWithDueDatesRequest, CalculateCreditDetailsRequest, PayInstallmentRequest } from "@application/requests/credit";
import { Credit } from "@domain/entities/credit";
import { DueDate } from "@domain/entities/dueDate";

export class CreditController {
  public constructor(
    private readonly grantCreditUsecase: GrantCredit,
    private readonly getCreditByIdUsecase: GetCreditById,
    private readonly getCustomerCreditsWithDueDatesUsecase: GetCustomerCreditsWithDueDates,
    private readonly simulateAmortizationScheduleUsecase: SimulateAmortizationSchedule,
    private readonly payInstallmentUsecase: PayInstallment
  ) {}

  public async grantCredit(request: GrantCreditRequest): Promise<Credit> {
    return await this.grantCreditUsecase.execute(request);
  }

  public async getCreditById(request: GetCreditByIdRequest, userId: string): Promise<Credit> {
    return await this.getCreditByIdUsecase.execute(request, userId);
  }

  public async getCustomerCreditsWithDueDates(request: GetCustomerCreditsWithDueDatesRequest): Promise<CreditWithDueDates[]> {
    return await this.getCustomerCreditsWithDueDatesUsecase.execute(request);
  }

  public simulateAmortizationSchedule(request: CalculateCreditDetailsRequest): AmortizationSchedule {
    return this.simulateAmortizationScheduleUsecase.execute(request);
  }

  public async payInstallment(request: PayInstallmentRequest): Promise<DueDate> {
    return await this.payInstallmentUsecase.execute(request);
  }
}
