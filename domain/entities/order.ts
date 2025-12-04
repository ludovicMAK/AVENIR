import { OrderDirection } from "@domain/values/orderDirection";
import { OrderValidity } from "@domain/values/orderValidity";
import { OrderStatus } from "@domain/values/orderStatus";

export class Order {
  constructor(
    readonly id: string,
    readonly customerId: string,
    readonly shareId: string,
    readonly direction: OrderDirection,
    readonly quantity: number,
    readonly priceLimit: number,
    readonly validity: OrderValidity,
    readonly status: OrderStatus,
    readonly dateCaptured: Date,
    readonly blockedAmount: number
  ) {}

  isActive(): boolean {
    return this.status === OrderStatus.ACTIVE;
  }

  isExecuted(): boolean {
    return this.status === OrderStatus.EXECUTED;
  }

  isCancelled(): boolean {
    return this.status === OrderStatus.CANCELLED;
  }

  isBuyOrder(): boolean {
    return this.direction === OrderDirection.BUY;
  }

  isSellOrder(): boolean {
    return this.direction === OrderDirection.SELL;
  }

  canBeExecuted(): boolean {
    return this.status === OrderStatus.ACTIVE;
  }

  canMatchWith(otherOrder: Order): boolean {
    if (!this.isActive() || !otherOrder.isActive()) {
      return false;
    }

    if (this.shareId !== otherOrder.shareId) {
      return false;
    }

    if (this.direction === otherOrder.direction) {
      return false;
    }

    if (this.isBuyOrder() && otherOrder.isSellOrder()) {
      return this.priceLimit >= otherOrder.priceLimit;
    }

    if (this.isSellOrder() && otherOrder.isBuyOrder()) {
      return otherOrder.priceLimit >= this.priceLimit;
    }

    return false;
  }

  static calculateBlockedAmountForBuy(
    priceLimit: number,
    quantity: number
  ): number {
    const BUYER_FEE = 100;
    return priceLimit * quantity + BUYER_FEE;
  }

  static calculateBlockedAmountForSell(
    currentPrice: number,
    quantity: number
  ): number {
    return currentPrice * quantity;
  }
}
