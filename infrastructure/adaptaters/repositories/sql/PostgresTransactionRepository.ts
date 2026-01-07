import { Pool } from "pg"
import { InfrastructureError } from "@application/errors"
import { ensureError } from "@application/utils/errors"
import { TransactionRepository } from "@application/repositories/transaction"
import { Transaction } from "@domain/entities/transaction"
import { UnitOfWork } from "@application/services/UnitOfWork"
import { PostgresUnitOfWork } from "@adapters/services/PostgresUnitOfWork"
import { TransactionDirection } from "@domain/values/transactionDirection"
import { StatusTransaction } from "@domain/values/statusTransaction"

export class PostgresTransactionRepository implements TransactionRepository {
    constructor(private readonly pool: Pool) {}

    async createTransaction(transaction: Transaction, unitOfWork?: UnitOfWork): Promise<void> {
        try {
            const client = unitOfWork instanceof PostgresUnitOfWork
                ? unitOfWork.getClient()
                : null;

            const query = `
                INSERT INTO transactions (id, account_iban, transaction_direction, amount, reason, account_date, status, transfer_id)
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
    async getAllTransactionsByTransferId(transferId: string): Promise<Transaction[]> {
        try {
            const result = await this.pool.query(
                `
                    SELECT id, account_iban, transaction_direction, amount, reason, account_date, status, transfer_id
                    FROM transactions
                    WHERE transfer_id = $1
                `,
                [transferId]
            );

            return result.rows.map(row => new Transaction(
                row.id,
                row.account_iban,
                TransactionDirection.from(row.transaction_direction),
                row.amount,
                row.reason,
                row.account_date,
                StatusTransaction.from(row.status),
                row.transfer_id
            ));
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }
    async update(transaction: Transaction, unitOfWork?: UnitOfWork): Promise<void> {
        try {
            const client = unitOfWork instanceof PostgresUnitOfWork
                ? unitOfWork.getClient()
                : null;

            const query = `
                UPDATE transactions
                SET account_IBAN = $2,
                    transaction_direction = $3,
                    amount = $4,
                    reason = $5,
                    account_date = $6,
                    status = $7,
                    transfer_id = $8
                WHERE id = $1
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

    async findByIban(iban: string): Promise<Transaction[]> {
        try {
            const query = `
                SELECT t.id, t.account_iban, t.transaction_direction, t.amount, t.reason, t.account_date, t.status, t.transfer_id
                FROM transactions t
                WHERE t.account_iban = $1
            `;

            const result = await this.pool.query(query, [iban]);

            return result.rows.map(row => new Transaction(
                row.id,
                row.account_iban,
                TransactionDirection.from(row.transaction_direction),
                row.amount,
                row.reason,
                row.account_date,
                StatusTransaction.from(row.status),
                row.transfer_id
            ));
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