import { ShareRepository } from "@application/repositories/share";
import { OrderRepository } from "@application/repositories/order";
import { NotFoundError, ValidationError } from "@application/errors";
import { Share } from "@domain/entities/share";
import { ToggleShareActivationInput } from "@application/requests/shares";

export class DeactivateShare {
  constructor(
    private readonly shareRepository: ShareRepository,
    private readonly orderRepository: OrderRepository
  ) {}

  async execute(input: ToggleShareActivationInput): Promise<Share> {
    const share = await this.shareRepository.findById(input.shareId);
    if (!share) {
      throw new NotFoundError("Share not found");
    }

    if (!share.isActive) {
      return share;
    }

    const activeOrders = await this.orderRepository.findActiveByShareId(
      input.shareId
    );
    if (activeOrders.length > 0) {
      throw new ValidationError(
        "Cannot deactivate a share with active orders. Cancel them first."
      );
    }

    const updatedShare = share.withActivation(false);
    await this.shareRepository.update(updatedShare);
    return updatedShare;
  }
}
