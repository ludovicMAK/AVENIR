import { OrderRepository } from "@application/repositories/order";
import { Order } from "@domain/entities/order";

export class GetOrdersByCustomer {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(customerId: string): Promise<Order[]> {
    return this.orderRepository.findByCustomerId(customerId);
  }
}
