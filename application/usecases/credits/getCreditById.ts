import { Credit } from "@domain/entities/credit";
import { CreditRepository } from "@application/repositories/credit";
import { SessionRepository } from "@application/repositories/session";
import { GetCreditByIdRequest } from "@application/requests/credit";
import { ConnectedError } from "@application/errors";

export class GetCreditById {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly creditRepository: CreditRepository
  ) {}

  async execute(request: GetCreditByIdRequest, userId: string): Promise<Credit> {
    const isConnected = await this.sessionRepository.isConnected(userId, request.token);
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    const credit = await this.creditRepository.findById(request.creditId);
    if (!credit) {
      throw new Error("Credit not found");
    }

    return credit;
  }
}
