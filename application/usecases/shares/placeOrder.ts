import { OrderRepository } from "@application/repositories/order";
import { ShareRepository } from "@application/repositories/share";
import { SecuritiesPositionRepository } from "@application/repositories/securitiesPosition";
import { AccountRepository } from "@application/repositories/account";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { Order } from "@domain/entities/order";
import { OrderStatus } from "@domain/values/orderStatus";
import { OrderDirection } from "@domain/values/orderDirection";
import { PlaceOrderInput } from "@application/requests/shares";
import {
  ValidationError,
  NotFoundError,
  InfrastructureError,
} from "@application/errors";

export class PlaceOrder {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly shareRepository: ShareRepository,
    private readonly securitiesPositionRepository: SecuritiesPositionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly uuidGenerator: UuidGenerator
  ) {}

  async execute(input: PlaceOrderInput): Promise<Order> {
    if (input.quantity <= 0) {
      throw new ValidationError("Quantity must be positive");
    }

    if (input.priceLimit <= 0) {
      throw new ValidationError("Price limit must be positive");
    }

    const share = await this.shareRepository.findById(input.shareId);
    if (!share) {
      throw new NotFoundError("Share not found");
    }

    if (!share.isAvailable()) {
      throw new ValidationError("Share is not available for trading");
    }

    const tradingAccounts = await this.accountRepository.findByOwnerId(
      input.customerId
    );
    const tradingAccount = tradingAccounts.find(
      (acc) => acc.accountType.getValue() === "trading"
    );

    if (!tradingAccount) {
      throw new NotFoundError("Trading account not found");
    }

    let blockedAmount = 0;

    if (input.direction === OrderDirection.BUY) {
      blockedAmount = Order.calculateBlockedAmountForBuy(
        input.priceLimit,
        input.quantity
      );

      if (!tradingAccount.canBlockFunds(blockedAmount)) {
        throw new ValidationError("Insufficient funds for buy order");
      }

      // Bloquer les fonds sur le compte trading
      await this.accountRepository.blockFunds(tradingAccount.id, blockedAmount);
    } else {
      const position =
        await this.securitiesPositionRepository.findByCustomerIdAndShareId(
          input.customerId,
          input.shareId
        );

      if (!position || !position.canSell(input.quantity)) {
        throw new ValidationError("Insufficient securities for sell order");
      }

      blockedAmount = Order.calculateBlockedAmountForSell(
        share.getCurrentPrice(),
        input.quantity
      );

      // Bloquer les titres dans la position
      await this.securitiesPositionRepository.updateQuantities(
        position.id,
        position.totalQuantity,
        position.blockedQuantity + input.quantity
      );
    }

    const orderId = this.uuidGenerator.generate();
    const order = new Order(
      orderId,
      input.customerId,
      input.shareId,
      input.direction,
      input.quantity,
      input.priceLimit,
      input.validity,
      OrderStatus.ACTIVE,
      new Date(),
      blockedAmount
    );

    await this.orderRepository.save(order);
    return order;
  }
}
