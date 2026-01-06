import { OrderRepository } from "@application/repositories/order";
import { ShareRepository } from "@application/repositories/share";
import { ShareTransactionRepository } from "@application/repositories/shareTransaction";
import { SecuritiesPositionRepository } from "@application/repositories/securitiesPosition";
import { AccountRepository } from "@application/repositories/account";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { ExecuteMatchingOrdersInput } from "@application/requests/shares";
import { ShareTransaction } from "@domain/entities/shareTransaction";
import { SecuritiesPosition } from "@domain/entities/securitiesPosition";
import { OrderStatus } from "@domain/values/orderStatus";
import { NotFoundError, InfrastructureError } from "@application/errors";

export type ExecutionResult = {
  shareId: string;
  executedTransactions: number;
  totalVolume: number;
  lastExecutedPrice: number | null;
};

export class ExecuteMatchingOrders {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly shareRepository: ShareRepository,
    private readonly shareTransactionRepository: ShareTransactionRepository,
    private readonly securitiesPositionRepository: SecuritiesPositionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator
  ) {}

  async execute(input: ExecuteMatchingOrdersInput): Promise<ExecutionResult> {
    const share = await this.shareRepository.findById(input.shareId);

    if (!share) {
      throw new NotFoundError("Share not found");
    }

    const activeOrders = await this.orderRepository.findActiveByShareId(
      input.shareId
    );

    const buyOrders = activeOrders
      .filter((order) => order.isBuyOrder())
      .sort((a, b) => b.priceLimit - a.priceLimit); // Prix décroissant (meilleurs acheteurs en premier)

    const sellOrders = activeOrders
      .filter((order) => order.isSellOrder())
      .sort((a, b) => a.priceLimit - b.priceLimit); // Prix croissant (meilleurs vendeurs en premier)

    let executedTransactions = 0;
    let totalVolume = 0;
    let lastExecutedPrice: number | null = null;

    await this.unitOfWork.begin();

    try {
      for (const buyOrder of buyOrders) {
        for (const sellOrder of sellOrders) {
          if (!buyOrder.canMatchWith(sellOrder)) {
            continue;
          }

          // Matching complet uniquement (pas d'exécution partielle)
          if (buyOrder.quantity !== sellOrder.quantity) {
            continue;
          }

          const executionPrice = sellOrder.priceLimit; // Le vendeur fixe le prix
          const quantity = buyOrder.quantity;

          // Créer la transaction
          const transactionId = this.uuidGenerator.generate();
          const transaction = new ShareTransaction(
            transactionId,
            input.shareId,
            buyOrder.id,
            sellOrder.id,
            buyOrder.customerId,
            sellOrder.customerId,
            executionPrice,
            quantity,
            new Date()
          );

          await this.shareTransactionRepository.save(transaction);

          // Débloquer et transférer les fonds de l'acheteur
          const buyerAccounts = await this.accountRepository.findByOwnerId(
            buyOrder.customerId
          );
          const buyerTradingAccount = buyerAccounts.find(
            (acc) => acc.accountType.getValue() === "trading"
          );

          if (!buyerTradingAccount) {
            throw new InfrastructureError("Buyer trading account not found");
          }

          // Débloquer les fonds bloqués lors de l'ordre
          await this.accountRepository.unblockFunds(
            buyerTradingAccount.id,
            buyOrder.blockedAmount,
            this.unitOfWork
          );

          // Déduire le montant total (prix + frais)
          const totalCostForBuyer = transaction.getTotalAmountForBuyer();
          await this.accountRepository.updateBalance(
            buyerTradingAccount.id,
            buyerTradingAccount.balance - totalCostForBuyer,
            this.unitOfWork
          );

          // Créditer le vendeur (prix - frais)
          const sellerAccounts = await this.accountRepository.findByOwnerId(
            sellOrder.customerId
          );
          const sellerTradingAccount = sellerAccounts.find(
            (acc) => acc.accountType.getValue() === "trading"
          );

          if (!sellerTradingAccount) {
            throw new InfrastructureError("Seller trading account not found");
          }

          const totalCreditForSeller = transaction.getTotalAmountForSeller();
          await this.accountRepository.updateBalance(
            sellerTradingAccount.id,
            sellerTradingAccount.balance + totalCreditForSeller,
            this.unitOfWork
          );

          // Transférer les titres du vendeur vers l'acheteur
          const sellerPosition =
            await this.securitiesPositionRepository.findByCustomerIdAndShareId(
              sellOrder.customerId,
              input.shareId
            );

          if (!sellerPosition) {
            throw new InfrastructureError("Seller position not found");
          }

          // Débloquer et retirer les titres du vendeur
          await this.securitiesPositionRepository.updateQuantities(
            sellerPosition.id,
            sellerPosition.totalQuantity - quantity,
            sellerPosition.blockedQuantity - quantity
          );

          // Supprimer la position si elle est vide
          if (sellerPosition.totalQuantity - quantity === 0) {
            await this.securitiesPositionRepository.delete(sellerPosition.id);
          }

          // Ajouter les titres à l'acheteur
          let buyerPosition =
            await this.securitiesPositionRepository.findByCustomerIdAndShareId(
              buyOrder.customerId,
              input.shareId
            );

          if (buyerPosition) {
            await this.securitiesPositionRepository.updateQuantities(
              buyerPosition.id,
              buyerPosition.totalQuantity + quantity,
              buyerPosition.blockedQuantity
            );
          } else {
            const newPositionId = this.uuidGenerator.generate();
            buyerPosition = new SecuritiesPosition(
              newPositionId,
              buyOrder.customerId,
              input.shareId,
              quantity,
              0
            );
            await this.securitiesPositionRepository.save(buyerPosition);
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

          // Mettre à jour le dernier prix exécuté
          await this.shareRepository.updateLastExecutedPrice(
            input.shareId,
            executionPrice
          );

          executedTransactions++;
          totalVolume += quantity;
          lastExecutedPrice = executionPrice;

          // Sortir de la boucle interne (ce buyOrder a été matché)
          break;
        }
      }

      await this.unitOfWork.commit();
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }

    return {
      shareId: input.shareId,
      executedTransactions,
      totalVolume,
      lastExecutedPrice,
    };
  }
}
