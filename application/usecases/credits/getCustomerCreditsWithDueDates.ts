import { CreditRepository } from "@application/repositories/credit";
import { DueDateRepository } from "@application/repositories/dueDate";
import { GetCustomerCreditsWithDueDatesRequest } from "@application/requests/credit";
import { CreditWithDueDates } from "@domain/types/CreditWithDueDates";
import { ConnectedError } from "@application/errors";
import { UserRepository } from "@application/repositories/users";

export class GetCustomerCreditsWithDueDates {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly creditRepository: CreditRepository,
    private readonly dueDateRepository: DueDateRepository
  ) {}

  async execute(request: GetCustomerCreditsWithDueDatesRequest): Promise<CreditWithDueDates[]> {
    const userInformationConnected = await this.userRepository.getInformationUserConnected(request.advisorId, request.token);
    if (!userInformationConnected || (userInformationConnected.role.getValue() !== "bankAdvisor" && userInformationConnected.role.getValue() !== "bankManager")) {
      throw new ConnectedError("Advisor is not connected");
    }

    const credits = await this.creditRepository.findByCustomerId(request.customerId);
    
    const creditsWithDueDates: CreditWithDueDates[] = [];

    for (const credit of credits) {
      const dueDates = await this.dueDateRepository.findByCreditId(credit.id);
      creditsWithDueDates.push({
        credit,
        dueDates,
      });
    }

    return creditsWithDueDates;
  }
}
