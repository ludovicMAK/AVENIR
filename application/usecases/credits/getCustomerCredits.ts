import { Credit } from "@domain/entities/credit";
import { CreditRepository } from "@application/repositories/credit";
import { SessionRepository } from "@application/repositories/session";
import { GetCustomerCreditsRequest } from "@application/requests/credit";
import { ConnectedError } from "@application/errors";

export class GetCustomerCredits {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly creditRepository: CreditRepository
  ) {}

  async execute(request: GetCustomerCreditsRequest): Promise<Credit[]> {
    const isConnected = await this.sessionRepository.isConnected(request.advisorId, request.token);
    if (!isConnected) {
      throw new ConnectedError("Advisor is not connected");
    }

    const credits = await this.creditRepository.findByCustomerId(request.customerId);
    return credits;
  }
}
