import { Pool } from "pg"
import { EmailConfirmationTokenRepository } from "@application/repositories/emailConfirmationTokens"
import { EmailConfirmationToken } from "@domain/entities/emailConfirmationToken"
import { InfrastructureError } from "@application/errors"
import { ensureError } from "@application/utils/errors"
import { EmailConfirmationTokenRow } from "@adapters/repositories/types/EmailConfirmationTokenRow"
import { TransferRepository } from "@application/repositories/transfer"
import { Transaction } from "@domain/entities/transaction"
import { Transfer } from "@domain/entities/transfer"

export class PostgresTransferRepository implements TransferRepository {
    constructor(private readonly pool: Pool) {}

    async save(transfer: Transfer): Promise<void> {
        try {
            await this.pool.query(
                `
                    INSERT INTO transfer (id, amount, date_requested,date_executed,description)
                    VALUES ($1, $2, $3, $4, $5)
                `,
                [
                    transfer.id,
                    transfer.amount,
                    transfer.dateRequested,
                    transfer.dateExecuted,
                    transfer.description,
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