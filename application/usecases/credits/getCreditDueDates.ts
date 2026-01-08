import { DueDateRepository } from "@application/repositories/dueDate";
import { CreditRepository } from "@application/repositories/credit";
import { SessionRepository } from "@application/repositories/session";
import { DueDate } from "@domain/entities/dueDate";
import { ConnectedError, NotFoundError, ValidationError } from "@application/errors";

export type GetCreditDueDatesRequest = {
  creditId: string;
  userId: string;
  token: string;
};

export class GetCreditDueDates {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly creditRepository: CreditRepository,
    private readonly dueDateRepository: DueDateRepository
  ) {}

  async execute(request: GetCreditDueDatesRequest): Promise<DueDate[]> {
    const isConnected = await this.sessionRepository.isConnected(request.userId, request.token);
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    const credit = await this.creditRepository.findById(request.creditId);
    if (!credit) {
      throw new NotFoundError("Credit not found");
    }

    if (credit.customerId !== request.userId) {
      throw new ValidationError("You do not have permission to view this credit's due dates");
    }

    const dueDates = await this.dueDateRepository.findByCreditId(credit.id);
    return dueDates;
  }
}
