import { TransactionRepository } from "@application/repositories/transaction";
import { Transaction } from "@domain/entities/transaction";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { InMemoryUnitOfWork } from "@adapters/services/InMemoryUnitOfWork";

export class InMemoryTransactionRepository implements TransactionRepository {
  private readonly items: Map<string, Transaction> = new Map();

  async createTransaction(
    transaction: Transaction,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    if (unitOfWork instanceof InMemoryUnitOfWork) {
      unitOfWork.registerChange({
        execute: async () => {
          this.items.set(transaction.id, transaction);
        },
      });
    } else {
      this.items.set(transaction.id, transaction);
    }
  }
  async getAllTransactionsByTransferId(
    transferId: string
  ): Promise<Transaction[]> {
    return Array.from(this.items.values()).filter(
      (transaction) => transaction.transferId === transferId
    );
  }
  async update(
    transaction: Transaction,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    if (unitOfWork instanceof InMemoryUnitOfWork) {
      unitOfWork.registerChange({
        execute: async () => {
          this.items.set(transaction.id, transaction);
        },
      });
    } else {
      this.items.set(transaction.id, transaction);
    }
  }

  async findByAccountIBAN(
    iban: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      direction?: string;
      status?: string;
    },
    pagination?: {
      page: number;
      limit: number;
    }
  ): Promise<{ transactions: Transaction[]; total: number }> {
    let transactions = Array.from(this.items.values()).filter(
      (transaction) => transaction.accountIBAN === iban
    );

    // Appliquer les filtres
    if (filters?.startDate) {
      transactions = transactions.filter(
        (t) => t.accountDate >= filters.startDate!
      );
    }

    if (filters?.endDate) {
      transactions = transactions.filter(
        (t) => t.accountDate <= filters.endDate!
      );
    }

    if (filters?.direction) {
      transactions = transactions.filter(
        (t) => t.transactionDirection.getValue() === filters.direction
      );
    }

    if (filters?.status) {
      transactions = transactions.filter(
        (t) => t.status.getValue() === filters.status
      );
    }

    // Trier par date décroissante
    transactions.sort(
      (a, b) => b.accountDate.getTime() - a.accountDate.getTime()
    );

    const total = transactions.length;

    // Appliquer la pagination
    if (pagination) {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;
      transactions = transactions.slice(offset, offset + limit);
    }

    return { transactions, total };
  }

  getAll(): Transaction[] {
    return Array.from(this.items.values());
  }

  clear(): void {
    this.items.clear();
  }
}
