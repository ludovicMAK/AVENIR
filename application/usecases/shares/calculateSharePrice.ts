import { OrderRepository } from "@application/repositories/order";
import { OrderDirection } from "@domain/values/orderDirection";

export interface PriceCalculation {
  equilibriumPrice: number | null;
  buyOrders: number;
  sellOrders: number;
  potentialVolume: number;
}

export class CalculateSharePrice {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(shareId: string): Promise<PriceCalculation> {
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

    if (buyOrders.length === 0 || sellOrders.length === 0) {
      return {
        equilibriumPrice: null,
        buyOrders: buyOrders.length,
        sellOrders: sellOrders.length,
        potentialVolume: 0,
      };
    }

    const sortedBuyOrders = buyOrders.sort(
      (a, b) => b.priceLimit - a.priceLimit
    );
    const sortedSellOrders = sellOrders.sort(
      (a, b) => a.priceLimit - b.priceLimit
    );

    const highestBuyPrice = sortedBuyOrders[0].priceLimit;
    const lowestSellPrice = sortedSellOrders[0].priceLimit;

    if (highestBuyPrice < lowestSellPrice) {
      return {
        equilibriumPrice: null,
        buyOrders: buyOrders.length,
        sellOrders: sellOrders.length,
        potentialVolume: 0,
      };
    }

    const equilibriumPrice = lowestSellPrice;

    let potentialVolume = 0;
    for (const buyOrder of sortedBuyOrders) {
      if (buyOrder.priceLimit >= equilibriumPrice) {
        for (const sellOrder of sortedSellOrders) {
          if (sellOrder.priceLimit <= equilibriumPrice) {
            potentialVolume += Math.min(buyOrder.quantity, sellOrder.quantity);
          }
        }
      }
    }

    return {
      equilibriumPrice,
      buyOrders: buyOrders.length,
      sellOrders: sellOrders.length,
      potentialVolume,
    };
  }
}
