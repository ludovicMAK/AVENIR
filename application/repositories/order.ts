import { Order } from "@domain/entities/order";
import { OrderDirection } from "@domain/values/orderDirection";
import { OrderStatus } from "@domain/values/orderStatus";

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  findByShareId(shareId: string): Promise<Order[]>;
  findActiveByShareId(shareId: string): Promise<Order[]>;
  findActiveByShareIdAndDirection(
    shareId: string,
    direction: OrderDirection
  ): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus): Promise<void>;
  updateBlockedAmount(orderId: string, amount: number): Promise<void>;
}
