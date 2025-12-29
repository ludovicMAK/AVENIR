import { TransactionRepository } from "@application/repositories/transaction"
import { Transaction } from "@domain/entities/transaction"
import { UnitOfWork } from "@application/services/UnitOfWork"
import { InMemoryUnitOfWork } from "@adapters/services/InMemoryUnitOfWork";

export class InMemoryTransactionRepository implements TransactionRepository {
    private readonly items: Map<string, Transaction> = new Map()

    async createTransaction(transaction: Transaction, unitOfWork?: UnitOfWork): Promise<void> {
        if (unitOfWork instanceof InMemoryUnitOfWork) {
            unitOfWork.registerChange({
                execute: async () => {
                    this.items.set(transaction.id, transaction);
                }
            });
        } else {
            this.items.set(transaction.id, transaction);
        }
    }
    async getAllTransactionsByTransferId(transferId: string): Promise<Transaction[]> {
        return Array.from(this.items.values()).filter(transaction => transaction.transferId === transferId);
    }
    async update(transaction: Transaction, unitOfWork?: UnitOfWork): Promise<void> {
        if (unitOfWork instanceof InMemoryUnitOfWork) {
            unitOfWork.registerChange({
                execute: async () => {
                    this.items.set(transaction.id, transaction);
                }
            });
        } else {
            this.items.set(transaction.id, transaction);
        }
    }

    getAll(): Transaction[] {
        return Array.from(this.items.values());
    }

    clear(): void {
        this.items.clear();
    }
}