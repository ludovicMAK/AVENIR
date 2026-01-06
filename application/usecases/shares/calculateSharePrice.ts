import { OrderRepository } from "@application/repositories/order";
import { ShareRepository } from "@application/repositories/share";
import { CalculateSharePriceInput } from "@application/requests/shares";
import { NotFoundError } from "@application/errors";

export type SharePriceCalculation = {
  shareId: string;
  currentPrice: number;
  equilibriumPrice: number | null;
  maxVolume: number;
  buyOrdersVolume: number;
  sellOrdersVolume: number;
  canMatch: boolean;
};

export class CalculateSharePrice {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly shareRepository: ShareRepository
  ) {}

  async execute(
    input: CalculateSharePriceInput
  ): Promise<SharePriceCalculation> {
    const share = await this.shareRepository.findById(input.shareId);

    if (!share) {
      throw new NotFoundError("Share not found");
    }

    const activeOrders = await this.orderRepository.findActiveByShareId(
      input.shareId
    );

    const buyOrders = activeOrders
      .filter((order) => order.isBuyOrder())
      .sort((a, b) => b.priceLimit - a.priceLimit);

    const sellOrders = activeOrders
      .filter((order) => order.isSellOrder())
      .sort((a, b) => a.priceLimit - b.priceLimit);

    const buyOrdersVolume = buyOrders.reduce((sum, o) => sum + o.quantity, 0);
    const sellOrdersVolume = sellOrders.reduce((sum, o) => sum + o.quantity, 0);

    // Trouver le prix d'équilibre
    let equilibriumPrice: number | null = null;
    let maxVolume = 0;

    if (buyOrders.length === 0 || sellOrders.length === 0) {
      return {
        shareId: share.id,
        currentPrice: share.getCurrentPrice(),
        equilibriumPrice: null,
        maxVolume: 0,
        buyOrdersVolume,
        sellOrdersVolume,
        canMatch: false,
      };
    }

    const buyPrices: number[] = [];
    const buyCumulativeVolumes: number[] = [];
    let buyCumulative = 0;

    buyOrders.forEach((order) => {
      buyCumulative += order.quantity;
      buyPrices.push(order.priceLimit);
      buyCumulativeVolumes.push(buyCumulative);
    });

    const sellPrices: number[] = [];
    const sellCumulativeVolumes: number[] = [];
    let sellCumulative = 0;

    sellOrders.forEach((order) => {
      sellCumulative += order.quantity;
      sellPrices.push(order.priceLimit);
      sellCumulativeVolumes.push(sellCumulative);
    });

    // Trouver le prix où les courbes se croisent (volume max échangeable)
    // Prix d'équilibre = prix où buy >= sell et volume maximal
    for (let i = 0; i < buyOrders.length; i++) {
      const buyPrice = buyOrders[i].priceLimit;
      const buyVolume = buyCumulativeVolumes[i];

      for (let j = 0; j < sellOrders.length; j++) {
        const sellPrice = sellOrders[j].priceLimit;
        const sellVolume = sellCumulativeVolumes[j];

        if (buyPrice >= sellPrice) {
          const matchableVolume = Math.min(buyVolume, sellVolume);
          if (matchableVolume > maxVolume) {
            maxVolume = matchableVolume;
            // Prix d'équilibre = prix de l'ordre SELL (standard de marché)
            equilibriumPrice = sellPrice;
          }
        }
      }
    }

    return {
      shareId: share.id,
      currentPrice: share.getCurrentPrice(),
      equilibriumPrice,
      maxVolume,
      buyOrdersVolume,
      sellOrdersVolume,
      canMatch: equilibriumPrice !== null,
    };
  }
}
