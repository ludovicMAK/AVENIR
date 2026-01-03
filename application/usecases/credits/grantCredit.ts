import { Credit } from "@domain/entities/credit";
import { CreditStatus } from "@domain/values/creditStatus";
import { CreditRepository } from "@application/repositories/credit";
import { SessionRepository } from "@application/repositories/session";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { GrantCreditRequest } from "@application/requests/credit";
import { ConnectedError } from "@application/errors";

export class GrantCredit {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly creditRepository: CreditRepository,
    private readonly uuidGenerator: UuidGenerator
  ) {}

  async execute(request: GrantCreditRequest): Promise<Credit> {
    const isConnected = await this.sessionRepository.isConnected(request.advisorId, request.token);
    if (!isConnected) {
      throw new ConnectedError("Advisor is not connected");
    }

    const creditId = this.uuidGenerator.generate();
    const now = new Date();

    const credit = new Credit(
      creditId,
      request.amountBorrowed,
      request.annualRate,
      request.insuranceRate,
      request.durationInMonths,
      now,
      CreditStatus.IN_PROGRESS,
      request.customerId
    );

    await this.creditRepository.save(credit);
    return credit;
  }
}
