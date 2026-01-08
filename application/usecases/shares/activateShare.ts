import { ShareRepository } from "@application/repositories/share";
import { NotFoundError } from "@application/errors";
import { Share } from "@domain/entities/share";
import { ToggleShareActivationInput } from "@application/requests/shares";

export class ActivateShare {
  constructor(private readonly shareRepository: ShareRepository) {}

  async execute(input: ToggleShareActivationInput): Promise<Share> {
    const share = await this.shareRepository.findById(input.shareId);
    if (!share) {
      throw new NotFoundError("Share not found");
    }

    if (share.isActive) {
      return share;
    }

    const updatedShare = share.withActivation(true);
    await this.shareRepository.update(updatedShare);
    return updatedShare;
  }
}
