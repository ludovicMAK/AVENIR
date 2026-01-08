import { ShareRepository } from "@application/repositories/share";
import { Share } from "@domain/entities/share";
import { UpdateShareInput } from "@application/requests/shares";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "@application/errors";

export class UpdateShare {
  constructor(private readonly shareRepository: ShareRepository) {}

  async execute(input: UpdateShareInput): Promise<Share> {
    const existingShare = await this.shareRepository.findById(input.shareId);
    if (!existingShare) {
      throw new NotFoundError("Share not found");
    }

    // Validation des inputs
    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        throw new ValidationError("Share name cannot be empty");
      }

      // Vérifier que le nom n'est pas déjà utilisé par une autre action
      const shareWithSameName = await this.shareRepository.findByName(
        input.name.trim()
      );
      if (shareWithSameName && shareWithSameName.id !== input.shareId) {
        throw new ConflictError("Share with this name already exists");
      }
    }

    if (
      input.totalNumberOfParts !== undefined &&
      input.totalNumberOfParts < 0
    ) {
      throw new ValidationError("Total number of parts cannot be negative");
    }

    // Créer la nouvelle version de l'action avec les modifications
    const updatedShare = new Share(
      existingShare.id,
      input.name?.trim() ?? existingShare.name,
      input.totalNumberOfParts ?? existingShare.totalNumberOfParts,
      existingShare.initialPrice, // Le prix initial ne peut pas être modifié
      existingShare.lastExecutedPrice
    );

    await this.shareRepository.update(updatedShare);
    return updatedShare;
  }
}
