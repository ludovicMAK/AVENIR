import { SecuritiesPositionRepository } from "@application/repositories/securitiesPosition";
import { SecuritiesPosition } from "@domain/entities/securitiesPosition";
import { GetPositionsInput } from "@application/requests/shares";

export class GetClientPositions {
  constructor(
    private readonly securitiesPositionRepository: SecuritiesPositionRepository
  ) {}

  async execute(input: GetPositionsInput): Promise<SecuritiesPosition[]> {
    return this.securitiesPositionRepository.findByCustomerId(input.customerId);
  }
}
