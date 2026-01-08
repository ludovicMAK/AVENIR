import { Pool } from "pg";
import { SavingsRateRepository } from "@application/repositories/savingsRate";
import { SavingsRate } from "@domain/entities/savingsRate";
import { SavingsRateRow } from "../types/SavingsRateRow";
import { InfrastructureError } from "@application/errors";
import { ensureError } from "@application/utils/errors";

export class PostgresSavingsRateRepository implements SavingsRateRepository {
  constructor(private readonly pool: Pool) {}

  async save(rate: SavingsRate): Promise<void> {
    try {
      await this.pool.query(
        `
          INSERT INTO savings_rates (id, rate, date_effect)
          VALUES ($1, $2, $3)
        `,
        [rate.id, rate.rate, rate.dateEffect]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<SavingsRate | null> {
    try {
      const result = await this.pool.query<SavingsRateRow>(
        `
          SELECT id, rate, date_effect
          FROM savings_rates
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        return null;
      }

      return this.mapRowToSavingsRate(result.rows[0]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<SavingsRate[]> {
    try {
      const result = await this.pool.query<SavingsRateRow>(
        `
          SELECT id, rate, date_effect
          FROM savings_rates
          ORDER BY date_effect DESC
        `
      );

      return result.rows.map((row) => this.mapRowToSavingsRate(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findActiveRate(date: Date): Promise<SavingsRate | null> {
    try {
      const result = await this.pool.query<SavingsRateRow>(
        `
          SELECT id, rate, date_effect
          FROM savings_rates
          WHERE date_effect <= $1
          ORDER BY date_effect DESC
          LIMIT 1
        `,
        [date]
      );

      if (result.rowCount === 0) {
        return null;
      }

      return this.mapRowToSavingsRate(result.rows[0]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findHistory(): Promise<SavingsRate[]> {
    return this.findAll();
  }

  private mapRowToSavingsRate(row: SavingsRateRow): SavingsRate {
    return new SavingsRate(row.id, Number(row.rate), new Date(row.date_effect));
  }

  private handleDatabaseError(unknownError: unknown): never {
    const error = ensureError(unknownError, "Unexpected database error");
    console.error("Database operation failed", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
