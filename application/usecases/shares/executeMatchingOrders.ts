import { OrderRepository } from "@application/repositories/order";
import { ShareTransactionRepository } from "@application/repositories/shareTransaction";
import { SecuritiesPositionRepository } from "@application/repositories/securitiesPosition";
import { AccountRepository } from "@application/repositories/account";
import { ShareRepository } from "@application/repositories/share";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { OrderDirection } from "@domain/values/orderDirection";
import { OrderStatus } from "@domain/values/orderStatus";
import { ShareTransaction } from "@domain/entities/shareTransaction";
import { NotFoundError, UnprocessableError } from "@application/errors";

export class ExecuteMatchingOrders {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly shareTransactionRepository: ShareTransactionRepository,
    private readonly securitiesPositionRepository: SecuritiesPositionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly shareRepository: ShareRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly unitOfWork: UnitOfWork
  ) {}

  async execute(shareId: string): Promise<ShareTransaction[]> {
    const share = await this.shareRepository.findById(shareId);
    if (!share) {
      throw new NotFoundError(`Share with id ${shareId} not found`);
    }

    await this.unitOfWork.begin();

    try {
      const transactions: ShareTransaction[] = [];

      // Récupérer tous les ordres actifs pour cette action
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

      // Trier les ordres : buy par prix décroissant, sell par prix croissant
      const sortedBuyOrders = buyOrders.sort(
        (a, b) => b.priceLimit - a.priceLimit
      );
      const sortedSellOrders = sellOrders.sort(
        (a, b) => a.priceLimit - b.priceLimit
      );

      // Matcher les ordres
      for (const buyOrder of sortedBuyOrders) {
        for (const sellOrder of sortedSellOrders) {
          if (!buyOrder.canMatchWith(sellOrder)) {
            continue;
          }

          // Prix d'exécution = prix limite du vendeur (ordre passé en premier)
          const executionPrice = sellOrder.priceLimit;
          const quantity = Math.min(buyOrder.quantity, sellOrder.quantity);

          // Créer la transaction
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
            100, // buyerFee
            100 // sellerFee
          );

          await this.shareTransactionRepository.save(transaction);
          transactions.push(transaction);

          // Transférer les fonds de l'acheteur au vendeur
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

          // Débloquer les fonds de l'acheteur et débiter le montant total
          const totalAmountForBuyer = transaction.getTotalAmountForBuyer();
          await this.accountRepository.updateBalanceAvailable(
            buyerAccount[0].id,
            buyerAccount[0].availableBalance - buyOrder.blockedAmount,
            this.unitOfWork
          );
          await this.accountRepository.updateBalance(
            buyerAccount[0].id,
            buyerAccount[0].balance - totalAmountForBuyer,
            this.unitOfWork
          );

          // Créditer le vendeur (montant - frais)
          const totalAmountForSeller = transaction.getTotalAmountForSeller();
          await this.accountRepository.updateBalance(
            sellerAccount[0].id,
            sellerAccount[0].balance + totalAmountForSeller,
            this.unitOfWork
          );

          // Transférer les titres du vendeur à l'acheteur
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

          // Débloquer et retirer les titres du vendeur
          await this.securitiesPositionRepository.updateQuantities(
            sellerPosition.id,
            sellerPosition.totalQuantity - quantity,
            sellerPosition.blockedQuantity - quantity
          );

          // Ajouter les titres à l'acheteur
          if (buyerPosition) {
            await this.securitiesPositionRepository.updateQuantities(
              buyerPosition.id,
              buyerPosition.totalQuantity + quantity,
              buyerPosition.blockedQuantity
            );
          } else {
            // Créer une nouvelle position pour l'acheteur - utiliser uuidGenerator
            const newPosition = {
              id: this.uuidGenerator.generate(),
              customerId: buyOrder.customerId,
              shareId: shareId,
              totalQuantity: quantity,
              blockedQuantity: 0,
            };
            await this.securitiesPositionRepository.save(newPosition as any);
          }

          // Mettre à jour le statut des ordres
          await this.orderRepository.updateStatus(
            buyOrder.id,
            OrderStatus.EXECUTED
          );
          await this.orderRepository.updateStatus(
            sellOrder.id,
            OrderStatus.EXECUTED
          );

          // Mettre à jour le prix de l'action
          await this.shareRepository.updateLastExecutedPrice(
            shareId,
            executionPrice
          );
        }
      }

      await this.unitOfWork.commit();
      return transactions;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
