import { OrderRepository } from "@application/repositories/order";
import { Order } from "@domain/entities/order";
import { OrderDirection } from "@domain/values/orderDirection";
import { OrderStatus } from "@domain/values/orderStatus";

export class InMemoryOrderRepository implements OrderRepository {
  private orders: Map<string, Order> = new Map();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.customerId === customerId)
      .sort((a, b) => b.dateCaptured.getTime() - a.dateCaptured.getTime());
  }

  async findByShareId(shareId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.shareId === shareId)
      .sort((a, b) => b.dateCaptured.getTime() - a.dateCaptured.getTime());
  }

  async findActiveByShareId(shareId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(
        (order) =>
          order.shareId === shareId && order.status === OrderStatus.ACTIVE
      )
      .sort((a, b) => a.dateCaptured.getTime() - b.dateCaptured.getTime());
  }

  async findActiveByShareIdAndDirection(
    shareId: string,
    direction: OrderDirection
  ): Promise<Order[]> {
    const orders = Array.from(this.orders.values()).filter(
      (order) =>
        order.shareId === shareId &&
        order.direction === direction &&
        order.status === OrderStatus.ACTIVE
    );

    if (direction === OrderDirection.BUY) {
      return orders.sort((a, b) => {
        if (b.priceLimit !== a.priceLimit) {
          return b.priceLimit - a.priceLimit;
        }
        return a.dateCaptured.getTime() - b.dateCaptured.getTime();
      });
    } else {
      return orders.sort((a, b) => {
        if (a.priceLimit !== b.priceLimit) {
          return a.priceLimit - b.priceLimit;
        }
        return a.dateCaptured.getTime() - b.dateCaptured.getTime();
      });
    }
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    const order = this.orders.get(orderId);
    if (order) {
      const updatedOrder = new Order(
        order.id,
        order.customerId,
        order.shareId,
        order.direction,
        order.quantity,
        order.priceLimit,
        order.validity,
        status,
        order.dateCaptured,
        order.blockedAmount
      );
      this.orders.set(orderId, updatedOrder);
    }
  }

  async updateBlockedAmount(orderId: string, amount: number): Promise<void> {
    const order = this.orders.get(orderId);
    if (order) {
      const updatedOrder = new Order(
        order.id,
        order.customerId,
        order.shareId,
        order.direction,
        order.quantity,
        order.priceLimit,
        order.validity,
        order.status,
        order.dateCaptured,
        amount
      );
      this.orders.set(orderId, updatedOrder);
    }
  }
}
