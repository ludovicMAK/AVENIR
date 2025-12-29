import { Pool } from "pg"
import { InfrastructureError } from "@application/errors"
import { ensureError } from "@application/utils/errors"
import { TransactionRepository } from "@application/repositories/transaction"
import { Transaction } from "@domain/entities/transaction"
import { UnitOfWork } from "@application/services/UnitOfWork"
import { PostgresUnitOfWork } from "@adapters/services/PostgresUnitOfWork"

export class PostgresTransactionRepository implements TransactionRepository {
    constructor(private readonly pool: Pool) {}

    async createTransaction(transaction: Transaction, unitOfWork?: UnitOfWork): Promise<void> {
        try {
            const client = unitOfWork instanceof PostgresUnitOfWork
                ? unitOfWork.getClient()
                : null;

            const query = `
                INSERT INTO transactions (id, account_IBAN, transaction_direction, amount, reason, account_date, status, transfer_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;

            const params = [
                transaction.id,
                transaction.accountIBAN,
                transaction.transactionDirection.getValue(),
                transaction.amount,
                transaction.reason,
                transaction.accountDate,
                transaction.status.getValue(),
                transaction.transferId,
            ];

            if (client) {
                await client.query(query, params);
            } else {
                await this.pool.query(query, params);
            }
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }

    private handleDatabaseError(unknownError: unknown): never {
        const error = ensureError(unknownError, "Unexpected database error")
        console.error("Database operation failed", error)
        throw new InfrastructureError("Database unavailable. Please try again later.")
    }
}