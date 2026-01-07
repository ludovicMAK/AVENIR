import { Credit } from "@domain/entities/credit";
import { DueDate } from "@domain/entities/dueDate";
import { CreditRepository } from "@application/repositories/credit";
import { DueDateRepository } from "@application/repositories/dueDate";
import { SessionRepository } from "@application/repositories/session";
import { GetMyCreditsRequest } from "@application/requests/credit";
import { ConnectedError } from "@application/errors";

export type CreditWithDueDates = {
  credit: Credit;
  dueDates: DueDate[];
};

export class GetMyCredits {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly creditRepository: CreditRepository,
    private readonly dueDateRepository: DueDateRepository
  ) {}

  async execute(request: GetMyCreditsRequest): Promise<CreditWithDueDates[]> {
    const isConnected = await this.sessionRepository.isConnected(request.customerId, request.token);
    if (!isConnected) {
      throw new ConnectedError("Customer is not connected");
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
