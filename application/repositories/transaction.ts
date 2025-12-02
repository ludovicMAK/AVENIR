import { Transaction } from "@domain/entities/transaction"
export interface TransactionRepository {
    createTransaction(transaction: Transaction): Promise<void>
}