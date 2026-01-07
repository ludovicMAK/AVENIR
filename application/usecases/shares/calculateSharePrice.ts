import { OrderRepository } from "@application/repositories/order";
import { OrderDirection } from "@domain/values/orderDirection";

interface PriceCalculation {
  equilibriumPrice: number | null;
  buyOrders: number;
  sellOrders: number;
  potentialVolume: number;
}

export class CalculateSharePrice {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(shareId: string): Promise<PriceCalculation> {
    // Récupérer tous les ordres actifs
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

    // Trier les ordres
    const sortedBuyOrders = buyOrders.sort(
      (a, b) => b.priceLimit - a.priceLimit
    );
    const sortedSellOrders = sellOrders.sort(
      (a, b) => a.priceLimit - b.priceLimit
    );

    // Trouver le prix d'équilibre (où offre et demande se rencontrent)
    const highestBuyPrice = sortedBuyOrders[0].priceLimit;
    const lowestSellPrice = sortedSellOrders[0].priceLimit;

    if (highestBuyPrice < lowestSellPrice) {
      // Pas de prix d'équilibre possible
      return {
        equilibriumPrice: null,
        buyOrders: buyOrders.length,
        sellOrders: sellOrders.length,
        potentialVolume: 0,
      };
    }

    // Le prix d'équilibre est le prix du vendeur (ordre passé en premier)
    const equilibriumPrice = lowestSellPrice;

    // Calculer le volume potentiel à ce prix
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
