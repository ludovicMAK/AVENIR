import { OrderRepository } from "@application/repositories/order";
import { ShareTransactionRepository } from "@application/repositories/shareTransaction";
import { SecuritiesPositionRepository } from "@application/repositories/securitiesPosition";
import { AccountRepository } from "@application/repositories/account";
import { ShareRepository } from "@application/repositories/share";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { UnitOfWorkFactory } from "@application/services/UnitOfWork";
import { OrderDirection } from "@domain/values/orderDirection";
import { OrderStatus } from "@domain/values/orderStatus";
import { ShareTransaction } from "@domain/entities/shareTransaction";
import { SecuritiesPosition } from "@domain/entities/securitiesPosition";
import { NotFoundError, UnprocessableError } from "@application/errors";

export class ExecuteMatchingOrders {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly shareTransactionRepository: ShareTransactionRepository,
    private readonly securitiesPositionRepository: SecuritiesPositionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly shareRepository: ShareRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly unitOfWorkFactory: UnitOfWorkFactory
  ) {}

  async execute(shareId: string): Promise<ShareTransaction[]> {
    const share = await this.shareRepository.findById(shareId);
    if (!share) {
      throw new NotFoundError(`Share with id ${shareId} not found`);
    }

    const unitOfWork = this.unitOfWorkFactory();
    await unitOfWork.begin();

    try {
      const transactions: ShareTransaction[] = [];
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

      const sortedBuyOrders = buyOrders.sort(
        (a, b) => b.priceLimit - a.priceLimit
      );
      const sortedSellOrders = sellOrders.sort(
        (a, b) => a.priceLimit - b.priceLimit
      );

      for (const buyOrder of sortedBuyOrders) {
        for (const sellOrder of sortedSellOrders) {
          if (!buyOrder.canMatchWith(sellOrder)) {
            continue;
          }

          const executionPrice = sellOrder.priceLimit;
          const quantity = Math.min(buyOrder.quantity, sellOrder.quantity);

          const transaction = new ShareTransaction(
            this.uuidGenerator.generate(),
            shareId,
            buyOrder.id,
            sellOrder.id,
            buyOrder.customerId,
            sellOrder.customerId,
            executionPrice,
            quantity,
            new Date(),
            100,
            100
          );

          await this.shareTransactionRepository.save(transaction);
          transactions.push(transaction);

          const buyerAccount = await this.accountRepository.findByOwnerId(
            buyOrder.customerId
          );
          const sellerAccount = await this.accountRepository.findByOwnerId(
            sellOrder.customerId
          );

          if (!buyerAccount || buyerAccount.length === 0) {
            throw new NotFoundError(
              `Buyer account not found for customer ${buyOrder.customerId}`
            );
          }
          if (!sellerAccount || sellerAccount.length === 0) {
            throw new NotFoundError(
              `Seller account not found for customer ${sellOrder.customerId}`
            );
          }

          const totalAmountForBuyer = transaction.getTotalAmountForBuyer();
          await this.accountRepository.updateBalanceAvailable(
            buyerAccount[0].id,
            buyerAccount[0].availableBalance - buyOrder.blockedAmount,
            unitOfWork
          );
          await this.accountRepository.updateBalance(
            buyerAccount[0].id,
            buyerAccount[0].balance - totalAmountForBuyer,
            unitOfWork
          );

          const totalAmountForSeller = transaction.getTotalAmountForSeller();
          await this.accountRepository.updateBalance(
            sellerAccount[0].id,
            sellerAccount[0].balance + totalAmountForSeller,
            unitOfWork
          );

          const sellerPosition =
            await this.securitiesPositionRepository.findByCustomerIdAndShareId(
              sellOrder.customerId,
              shareId
            );
          const buyerPosition =
            await this.securitiesPositionRepository.findByCustomerIdAndShareId(
              buyOrder.customerId,
              shareId
            );

          if (!sellerPosition) {
            throw new NotFoundError(
              `Seller position not found for customer ${sellOrder.customerId}`
            );
          }

          await this.securitiesPositionRepository.updateQuantities(
            sellerPosition.id,
            sellerPosition.totalQuantity - quantity,
            sellerPosition.blockedQuantity - quantity
          );

          if (buyerPosition) {
            await this.securitiesPositionRepository.updateQuantities(
              buyerPosition.id,
              buyerPosition.totalQuantity + quantity,
              buyerPosition.blockedQuantity
            );
          } else {
            const newPosition = new SecuritiesPosition(
              this.uuidGenerator.generate(),
              buyOrder.customerId,
              shareId,
              quantity,
              0
            );
            await this.securitiesPositionRepository.save(newPosition);
          }

          await this.orderRepository.updateStatus(
            buyOrder.id,
            OrderStatus.EXECUTED
          );
          await this.orderRepository.updateStatus(
            sellOrder.id,
            OrderStatus.EXECUTED
          );

          await this.shareRepository.updateLastExecutedPrice(
            shareId,
            executionPrice
          );
        }
      }

      await unitOfWork.commit();
      return transactions;
    } catch (error) {
      await unitOfWork.rollback();
      throw error;
    }
  }
}
