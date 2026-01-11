import { Pool } from "pg";
import { InfrastructureError } from "@application/errors";
import { ensureError, ErrorLike } from "@application/utils/errors";
import { TransactionRepository } from "@application/repositories/transaction";
import { Transaction } from "@domain/entities/transaction";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { PostgresUnitOfWork } from "@adapters/services/PostgresUnitOfWork";
import { TransactionDirection } from "@domain/values/transactionDirection";
import { StatusTransaction } from "@domain/values/statusTransaction";

export class PostgresTransactionRepository implements TransactionRepository {
  constructor(private readonly pool: Pool) {}

  async createTransaction(
    transaction: Transaction,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    try {
      const client =
        unitOfWork instanceof PostgresUnitOfWork
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
        transaction.transferId ?? null,
      ];

      if (client) {
        await client.query(query, params);
      } else {
        await this.pool.query(query, params);
      }
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }
  async getAllTransactionsByTransferId(
    transferId: string
  ): Promise<Transaction[]> {
    try {
      const result = await this.pool.query(
        `
                    SELECT id, account_iban, transaction_direction, amount, reason, account_date, status, transfer_id
                    FROM transactions
                    WHERE transfer_id = $1
                `,
        [transferId]
      );

      return result.rows.map(
        (row) =>
          new Transaction(
            row.id,
            row.account_iban,
            TransactionDirection.from(row.transaction_direction),
            parseFloat(row.amount),
            row.reason,
            row.account_date,
            StatusTransaction.from(row.status),
            row.transfer_id ?? null
          )
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }
  async update(
    transaction: Transaction,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    try {
      const client =
        unitOfWork instanceof PostgresUnitOfWork
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
        transaction.transferId ?? null,
      ];

      if (client) {
        await client.query(query, params);
      } else {
        await this.pool.query(query, params);
      }
    } catch (error) {
      this.handleDatabaseError(error);
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
    try {
      const conditions: string[] = ["account_iban = $1"];
      const params: Array<string | number | Date> = [iban];
      let paramIndex = 2;

      if (filters?.startDate) {
        conditions.push(`account_date >= $${paramIndex}`);
        params.push(filters.startDate);
        paramIndex++;
      }

      if (filters?.endDate) {
        conditions.push(`account_date <= $${paramIndex}`);
        params.push(filters.endDate);
        paramIndex++;
      }

      if (filters?.direction) {
        conditions.push(`transaction_direction = $${paramIndex}`);
        params.push(filters.direction);
        paramIndex++;
      }

      if (filters?.status) {
        conditions.push(`status = $${paramIndex}`);
        params.push(filters.status);
        paramIndex++;
      }

      const whereClause = conditions.join(" AND ");

      const countQuery = `SELECT COUNT(*) as total FROM transactions WHERE ${whereClause}`;
      const countResult = await this.pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total, 10);

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const offset = (page - 1) * limit;

      const query = `
                SELECT id, account_iban, transaction_direction, amount, reason, account_date, status, transfer_id
                FROM transactions
                WHERE ${whereClause}
                ORDER BY account_date DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

      const queryParams = [...params, limit, offset];
      const result = await this.pool.query(query, queryParams);

      const transactions = result.rows.map(
        (row) =>
          new Transaction(
            row.id,
            row.account_iban,
            TransactionDirection.from(row.transaction_direction),
            parseFloat(row.amount),
            row.reason,
            row.account_date,
            StatusTransaction.from(row.status),
            row.transfer_id ?? null
          )
      );

      return { transactions, total };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }
  async findByIban(iban: string): Promise<Transaction[]> {
    try {
      const query = `
                SELECT t.id, t.account_iban, t.transaction_direction, t.amount, t.reason, t.account_date, t.status, t.transfer_id
                FROM transactions t
                WHERE t.account_iban = $1
                ORDER BY t.account_date DESC
            `;

      const result = await this.pool.query(query, [iban]);

      return result.rows.map(
        (row) =>
          new Transaction(
            row.id,
            row.account_iban,
            TransactionDirection.from(row.transaction_direction),
            parseFloat(row.amount),
            row.reason,
            row.account_date,
            StatusTransaction.from(row.status),
            row.transfer_id ?? null
          )
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private handleDatabaseError(unknownError: ErrorLike): never {
    const error = ensureError(unknownError, "Unexpected database error");
    console.error("Database operation failed", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
