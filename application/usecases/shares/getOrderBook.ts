import { OrderRepository } from "@application/repositories/order";
import { ShareRepository } from "@application/repositories/share";
import { GetOrderBookInput } from "@application/requests/shares";
import { OrderDirection } from "@domain/values/orderDirection";
import { NotFoundError } from "@application/errors";

export type OrderBookLevel = {
  price: number;
  totalQuantity: number;
  orderCount: number;
};

export type OrderBookResult = {
  shareId: string;
  shareName: string;
  currentPrice: number;
  buyOrders: OrderBookLevel[];
  sellOrders: OrderBookLevel[];
  spread: number | null;
  bestBuyPrice: number | null;
  bestSellPrice: number | null;
};

export class GetOrderBook {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly shareRepository: ShareRepository
  ) {}

  async execute(input: GetOrderBookInput): Promise<OrderBookResult> {
    const share = await this.shareRepository.findById(input.shareId);

    if (!share) {
      throw new NotFoundError("Share not found");
    }

    const activeOrders = await this.orderRepository.findActiveByShareId(
      input.shareId
    );

    // Grouper les ordres BUY par prix
    const buyOrdersMap = new Map<number, { quantity: number; count: number }>();
    const sellOrdersMap = new Map<
      number,
      { quantity: number; count: number }
    >();

    activeOrders.forEach((order) => {
      const map = order.isBuyOrder() ? buyOrdersMap : sellOrdersMap;
      const existing = map.get(order.priceLimit) || {
        quantity: 0,
        count: 0,
      };
      map.set(order.priceLimit, {
        quantity: existing.quantity + order.quantity,
        count: existing.count + 1,
      });
    });

    // Convertir en array et trier
    const buyOrders: OrderBookLevel[] = Array.from(buyOrdersMap.entries())
      .map(([price, data]) => ({
        price,
        totalQuantity: data.quantity,
        orderCount: data.count,
      }))
      .sort((a, b) => b.price - a.price); // Décroissant (meilleur prix en premier)

    const sellOrders: OrderBookLevel[] = Array.from(sellOrdersMap.entries())
      .map(([price, data]) => ({
        price,
        totalQuantity: data.quantity,
        orderCount: data.count,
      }))
      .sort((a, b) => a.price - b.price); // Croissant (meilleur prix en premier)

    const bestBuyPrice = buyOrders[0]?.price ?? null;
    const bestSellPrice = sellOrders[0]?.price ?? null;
    const spread =
      bestBuyPrice !== null && bestSellPrice !== null
        ? bestSellPrice - bestBuyPrice
        : null;

    return {
      shareId: share.id,
      shareName: share.name,
      currentPrice: share.getCurrentPrice(),
      buyOrders,
      sellOrders,
      spread,
      bestBuyPrice,
      bestSellPrice,
    };
  }
}
