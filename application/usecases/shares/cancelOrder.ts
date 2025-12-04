import { OrderRepository } from "@application/repositories/order";
import { OrderStatus } from "@domain/values/orderStatus";
import { CancelOrderInput } from "@application/requests/shares";
import { NotFoundError, ValidationError } from "@application/errors";

export class CancelOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(input: CancelOrderInput): Promise<void> {
    const order = await this.orderRepository.findById(input.orderId);

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.customerId !== input.customerId) {
      throw new ValidationError("You can only cancel your own orders");
    }

    if (!order.canBeExecuted()) {
      throw new ValidationError("Order cannot be cancelled");
    }

    await this.orderRepository.updateStatus(
      input.orderId,
      OrderStatus.CANCELLED
    );
  }
}
