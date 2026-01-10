import { OrderRepository } from "@application/repositories/order";
import { OrderDirection } from "@domain/values/orderDirection";

interface OrderBookLevel {
  price: number;
  quantity: number;
  orders: number;
}

interface OrderBook {
  shareId: string;
  buyOrders: OrderBookLevel[];
  sellOrders: OrderBookLevel[];
  spread: number | null;
}

export class GetOrderBook {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(shareId: string): Promise<OrderBook> {
    const buyOrders =
      await this.orderRepository.findActiveByShareIdAndDirection(
        shareId,
        OrderDirection.BUY
      );
    const sellOrders =
      await this.orderRepository.findActiveByShareIdAndDirection(
        shareId,
        OrderDirection.SELL
      );

    const buyLevels = this.aggregateOrdersByPrice(buyOrders);
    const sortedBuyLevels = buyLevels.sort((a, b) => b.price - a.price);

    const sellLevels = this.aggregateOrdersByPrice(sellOrders);
    const sortedSellLevels = sellLevels.sort((a, b) => a.price - b.price);

    let spread: number | null = null;
    if (sortedBuyLevels.length > 0 && sortedSellLevels.length > 0) {
      const bestBid = sortedBuyLevels[0].price;
      const bestAsk = sortedSellLevels[0].price;
      spread = bestAsk - bestBid;
    }

    return {
      shareId,
      buyOrders: sortedBuyLevels,
      sellOrders: sortedSellLevels,
      spread,
    };
  }

  private aggregateOrdersByPrice(orders: any[]): OrderBookLevel[] {
    const priceMap = new Map<number, { quantity: number; count: number }>();

    for (const order of orders) {
      const existing = priceMap.get(order.priceLimit) || {
        quantity: 0,
        count: 0,
      };
      priceMap.set(order.priceLimit, {
        quantity: existing.quantity + order.quantity,
        count: existing.count + 1,
      });
    }

    return Array.from(priceMap.entries()).map(([price, data]) => ({
      price,
      quantity: data.quantity,
      orders: data.count,
    }));
  }
}
