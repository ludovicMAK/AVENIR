import { GrantCredit } from "@application/usecases/credits/grantCredit";
import { GetCreditById } from "@application/usecases/credits/getCreditById";
import { GetCustomerCredits } from "@application/usecases/credits/getCustomerCredits";
import { CalculateCreditDetails, CreditDetails } from "@application/usecases/credits/calculateCreditDetails";
import { GrantCreditRequest, GetCreditByIdRequest, GetCustomerCreditsRequest, CalculateCreditDetailsRequest } from "@application/requests/credit";
import { Credit } from "@domain/entities/credit";

export class CreditController {
  public constructor(
    private readonly grantCreditUsecase: GrantCredit,
    private readonly getCreditByIdUsecase: GetCreditById,
    private readonly getCustomerCreditsUsecase: GetCustomerCredits,
    private readonly calculateCreditDetailsUsecase: CalculateCreditDetails
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
}
