import { SavingsRateRepository } from "@application/repositories/savingsRate";

export class GetSavingsRateHistory {
  constructor(private readonly savingsRateRepository: SavingsRateRepository) {}

  async execute() {
    return this.savingsRateRepository.findHistory();
  }
}
