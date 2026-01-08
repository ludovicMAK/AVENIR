import { ShareRepository } from "@application/repositories/share";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { Share } from "@domain/entities/share";
import { CreateShareInput } from "@application/requests/shares";
import { ValidationError, ConflictError } from "@application/errors";
import { InvalidShareDataError } from "@domain/errors";

export class CreateShare {
  constructor(
    private readonly shareRepository: ShareRepository,
    private readonly uuidGenerator: UuidGenerator
  ) {}

  async execute(input: CreateShareInput): Promise<Share> {
    const name = input.name.trim();
    const shareId = this.uuidGenerator.generate();

    let share: Share;
    try {
      share = new Share(
        shareId,
        name,
        input.totalNumberOfParts,
        input.initialPrice,
        null
      );
    } catch (error) {
      if (error instanceof InvalidShareDataError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    const existingShare = await this.shareRepository.findByName(share.name);
    if (existingShare) {
      throw new ConflictError("Share with this name already exists");
    }

    await this.shareRepository.save(share);
    return share;
  }
}
