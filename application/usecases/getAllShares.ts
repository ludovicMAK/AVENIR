import { ShareRepository } from "@application/repositories/share";
import { Share } from "@domain/entities/share";

export class GetAllShares {
  constructor(private readonly shareRepository: ShareRepository) {}

  async execute(): Promise<Share[]> {
    return this.shareRepository.findAll();
  }
}
