import { Transaction } from "@domain/entities/transaction"
import { UnitOfWork } from "@application/services/UnitOfWork";

export interface TransactionRepository {
    createTransaction(transaction: Transaction, unitOfWork?: UnitOfWork): Promise<void>
}