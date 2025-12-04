import { ShareRepository } from "@application/repositories/share";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { Share } from "@domain/entities/share";
import { CreateShareInput } from "@application/requests/shares";
import { ValidationError, ConflictError } from "@application/errors";

export class CreateShare {
  constructor(
    private readonly shareRepository: ShareRepository,
    private readonly uuidGenerator: UuidGenerator
  ) {}

  async execute(input: CreateShareInput): Promise<Share> {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError("Share name is required");
    }

    if (input.totalNumberOfParts <= 0) {
      throw new ValidationError("Total number of parts must be positive");
    }

    if (input.initialPrice <= 0) {
      throw new ValidationError("Initial price must be positive");
    }

    const existingShare = await this.shareRepository.findByName(
      input.name.trim()
    );
    if (existingShare) {
      throw new ConflictError("Share with this name already exists");
    }

    const shareId = this.uuidGenerator.generate();
    const share = new Share(
      shareId,
      input.name.trim(),
      input.totalNumberOfParts,
      input.initialPrice,
      null
    );

    await this.shareRepository.save(share);
    return share;
  }
}
