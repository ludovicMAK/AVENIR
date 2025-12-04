import { TransactionRepository } from "@application/repositories/transaction"
import { Transaction } from "@domain/entities/transaction"

export class InMemoryTransactionRepository implements TransactionRepository {
    private readonly items: Map<string, Transaction> = new Map()

    async createTransaction(transaction: Transaction): Promise<void> {
        this.items.set(transaction.id, transaction);
    }
}