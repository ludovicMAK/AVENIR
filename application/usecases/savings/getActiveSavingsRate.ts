import { SavingsRateRepository } from "@application/repositories/savingsRate";
import { UnprocessableError, ValidationError } from "@application/errors";
import { GetActiveSavingsRateRequest } from "@application/requests/savings";

export class GetActiveSavingsRate {
  constructor(private readonly savingsRateRepository: SavingsRateRepository) {}

  async execute(request: GetActiveSavingsRateRequest) {
    const date = request.date ? new Date(request.date) : new Date();
    if (request.date && Number.isNaN(date.getTime())) {
      throw new ValidationError("Invalid date.");
    }
    const activeRate = await this.savingsRateRepository.findActiveRate(date);

    if (!activeRate) {
      throw new UnprocessableError("No active savings rate is defined.");
    }

    return activeRate;
  }
}
