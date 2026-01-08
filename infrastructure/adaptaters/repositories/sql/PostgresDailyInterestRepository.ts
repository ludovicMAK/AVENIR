import { Pool } from "pg";
import { DailyInterestRepository } from "@application/repositories/dailyInterest";
import { DailyInterest } from "@domain/entities/dailyInterest";
import { CreditMode } from "@domain/values/creditMode";
import { InfrastructureError } from "@application/errors";
import { ensureError } from "@application/utils/errors";
import { DailyInterestRow } from "../types/DailyInterestRow";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { PostgresUnitOfWork } from "@adapters/services/PostgresUnitOfWork";

export class PostgresDailyInterestRepository
  implements DailyInterestRepository
{
  constructor(private readonly pool: Pool) {}

  async save(
    interest: DailyInterest,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    try {
      const client =
        unitOfWork instanceof PostgresUnitOfWork
          ? unitOfWork.getClient()
          : null;

      const query = `
          INSERT INTO daily_interests (id, date, calculation_base, applied_rate, calculated_interest, credit_mode, account_id, transaction_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
      const params = [
        interest.id,
        interest.date,
        interest.calculationBase,
        interest.appliedRate,
        interest.calculatedInterest,
        interest.creditMode.getValue(),
        interest.accountId,
        interest.transactionId ?? null,
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

  async findById(id: string): Promise<DailyInterest | null> {
    try {
      const result = await this.pool.query<DailyInterestRow>(
        `
          SELECT id, date, calculation_base, applied_rate, calculated_interest, credit_mode, account_id, transaction_id
          FROM daily_interests
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        return null;
      }

      return this.mapRowToDailyInterest(result.rows[0]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByAccountId(accountId: string): Promise<DailyInterest[]> {
    try {
      const result = await this.pool.query<DailyInterestRow>(
        `
          SELECT id, date, calculation_base, applied_rate, calculated_interest, credit_mode, account_id, transaction_id
          FROM daily_interests
          WHERE account_id = $1
          ORDER BY date DESC
        `,
        [accountId]
      );

      return result.rows.map((row) => this.mapRowToDailyInterest(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByDate(date: Date): Promise<DailyInterest[]> {
    try {
      const result = await this.pool.query<DailyInterestRow>(
        `
          SELECT id, date, calculation_base, applied_rate, calculated_interest, credit_mode, account_id, transaction_id
          FROM daily_interests
          WHERE date = $1
        `,
        [date]
      );

      return result.rows.map((row) => this.mapRowToDailyInterest(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByDateRange(
    accountId: string,
    from: Date,
    to: Date
  ): Promise<DailyInterest[]> {
    try {
      const result = await this.pool.query<DailyInterestRow>(
        `
          SELECT id, date, calculation_base, applied_rate, calculated_interest, credit_mode, account_id, transaction_id
          FROM daily_interests
          WHERE account_id = $1
            AND date BETWEEN $2 AND $3
          ORDER BY date DESC
        `,
        [accountId, from, to]
      );

      return result.rows.map((row) => this.mapRowToDailyInterest(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private mapRowToDailyInterest(row: DailyInterestRow): DailyInterest {
    return new DailyInterest(
      row.id,
      new Date(row.date),
      Number(row.calculation_base),
      Number(row.applied_rate),
      Number(row.calculated_interest),
      CreditMode.from(row.credit_mode),
      row.account_id,
      row.transaction_id
    );
  }

  private handleDatabaseError(unknownError: unknown): never {
    const error = ensureError(unknownError, "Unexpected database error");
    console.error("Database operation failed", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
