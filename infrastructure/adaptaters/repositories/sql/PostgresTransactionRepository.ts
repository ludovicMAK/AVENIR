import { Pool } from "pg"
import { EmailConfirmationTokenRepository } from "@application/repositories/emailConfirmationTokens"
import { EmailConfirmationToken } from "@domain/entities/emailConfirmationToken"
import { InfrastructureError } from "@application/errors"
import { ensureError } from "@application/utils/errors"
import { EmailConfirmationTokenRow } from "@adapters/repositories/types/EmailConfirmationTokenRow"
import { TransactionRepository } from "@application/repositories/transaction"
import { Transaction } from "@domain/entities/transaction"

export class PostgresTransactionRepository implements TransactionRepository {
    constructor(private readonly pool: Pool) {}

    async createTransaction(transaction: Transaction): Promise<void> {
        try {
            await this.pool.query(
                `
                    INSERT INTO transactions (id, account_id, transaction_direction, amount, reason,account_date,status,transfer_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `,
                [
                    transaction.id,
                    transaction.accountIBAN,
                    transaction.transactionDirection.getValue(),
                    transaction.amount,
                    transaction.reason,
                    transaction.accountDate,
                    transaction.status.getValue(),
                    transaction.transferId,
                ],
            )
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