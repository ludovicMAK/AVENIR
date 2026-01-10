import { ShareRepository } from "@application/repositories/share";
import { OrderRepository } from "@application/repositories/order";
import { SecuritiesPositionRepository } from "@application/repositories/securitiesPosition";
import { DeleteShareInput } from "@application/requests/shares";
import { NotFoundError, ConflictError } from "@application/errors";
import { OrderStatus } from "@domain/values/orderStatus";

export class DeleteShare {
  constructor(
    private readonly shareRepository: ShareRepository,
    private readonly orderRepository: OrderRepository,
    private readonly securitiesPositionRepository: SecuritiesPositionRepository
  ) {}

  async execute(input: DeleteShareInput): Promise<void> {
    const share = await this.shareRepository.findById(input.shareId);
    if (!share) {
      throw new NotFoundError("Share not found");
    }

    const activeOrders = await this.orderRepository.findActiveByShareId(
      input.shareId
    );
    if (activeOrders.length > 0) {
      throw new ConflictError(
        "Cannot delete share with active orders. Please cancel all orders first."
      );
    }

    const positions = await this.securitiesPositionRepository.findByShareId(
      input.shareId
    );
    const hasActivePositions = positions.some(
      (position) => position.totalQuantity > 0
    );

    if (hasActivePositions) {
      throw new ConflictError(
        "Cannot delete share that is owned by clients. Please wait until all shares are sold."
      );
    }

    await this.shareRepository.delete(input.shareId);
  }
}
