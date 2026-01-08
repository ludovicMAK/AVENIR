import { SavingsRateRepository } from "@application/repositories/savingsRate";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { ForbiddenError, ValidationError } from "@application/errors";
import { UpdateSavingsRateRequest } from "@application/requests/savings";
import { SavingsRate } from "@domain/entities/savingsRate";
import { Role } from "@domain/values/role";

export class UpdateSavingsRate {
  constructor(
    private readonly savingsRateRepository: SavingsRateRepository,
    private readonly uuidGenerator: UuidGenerator
  ) {}

  async execute(request: UpdateSavingsRateRequest): Promise<SavingsRate> {
    if (!request.actorRole.equals(Role.MANAGER)) {
      throw new ForbiddenError(
        "Only a bank director can update the savings rate."
      );
    }

    if (request.rate <= 0) {
      throw new ValidationError("Savings rate must be greater than 0.");
    }

    const dateEffect = request.dateEffect
      ? new Date(request.dateEffect)
      : new Date();
    if (Number.isNaN(dateEffect.getTime())) {
      throw new ValidationError("Invalid effective date.");
    }

    const savingsRate = new SavingsRate(
      this.uuidGenerator.generate(),
      request.rate,
      dateEffect
    );

    await this.savingsRateRepository.save(savingsRate);

    return savingsRate;
  }
}
