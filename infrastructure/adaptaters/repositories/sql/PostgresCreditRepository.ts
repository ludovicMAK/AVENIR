import { Pool } from "pg";
import { CreditRepository } from "@application/repositories/credit";
import { InfrastructureError } from "@application/errors";
import { ensureError } from "@application/utils/errors";
import { Credit } from "@domain/entities/credit";
import { CreditRow } from "../types/CreditRow";
import { CreditStatus } from "@domain/values/creditStatus";
import { PostgresUnitOfWork } from "@adapters/services/PostgresUnitOfWork";


export class PostgresCreditRepository implements CreditRepository {
  constructor(private readonly pool: Pool) {}

  async save(credit: Credit, unitOfWork?: PostgresUnitOfWork): Promise<void> {
    try {
      const client = unitOfWork instanceof PostgresUnitOfWork ? unitOfWork.getClient() : null;
      const executor: any = client || this.pool;

      await executor.query(
        `
          INSERT INTO credits (id, amount_borrowed, annual_rate, insurance_rate, duration_in_months, start_date, status, customer_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          credit.id,
          credit.amountBorrowed,
          credit.annualRate,
          credit.insuranceRate,
          credit.durationInMonths,
          credit.startDate,
          credit.status.getValue(),
          credit.customerId,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<Credit | null> {
    try {
      const result = await this.pool.query<CreditRow>(
        `
          SELECT id, amount_borrowed, annual_rate, insurance_rate, duration_in_months, start_date, status, customer_id
          FROM credits
          WHERE id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.rowToCredit(result.rows[0]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByCustomerId(customerId: string): Promise<Credit[]> {
    try {
      const result = await this.pool.query<CreditRow>(
        `
          SELECT id, amount_borrowed, annual_rate, insurance_rate, duration_in_months, start_date, status, customer_id
          FROM credits
          WHERE customer_id = $1
          ORDER BY start_date DESC
        `,
        [customerId]
      );

      return result.rows.map((row) => this.rowToCredit(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByStatus(status: string): Promise<Credit[]> {
    try {
      const result = await this.pool.query<CreditRow>(
        `
          SELECT id, amount_borrowed, annual_rate, insurance_rate, duration_in_months, start_date, status, customer_id
          FROM credits
          WHERE status = $1
          ORDER BY start_date DESC
        `,
        [status]
      );

      return result.rows.map((row) => this.rowToCredit(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async update(credit: Credit, unitOfWork?: PostgresUnitOfWork): Promise<void> {
    try {
      const client = unitOfWork ? unitOfWork.getClient() : this.pool;
      await client.query(
        `
          UPDATE credits
          SET amount_borrowed = $2, annual_rate = $3, insurance_rate = $4, duration_in_months = $5, start_date = $6, status = $7, customer_id = $8, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [
          credit.id,
          credit.amountBorrowed,
          credit.annualRate,
          credit.insuranceRate,
          credit.durationInMonths,
          credit.startDate,
          credit.status.getValue(),
          credit.customerId
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async delete(creditId: string): Promise<void> {
    try {
      await this.pool.query(
        `
          DELETE FROM credits
          WHERE id = $1
        `,
        [creditId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private rowToCredit(row: CreditRow): Credit {
    return new Credit(
      row.id,
      row.amount_borrowed,
      row.annual_rate,
      row.insurance_rate,
      row.duration_in_months,
      new Date(row.start_date),
      CreditStatus.from(row.status),
      row.customer_id
    );
  }

  private handleDatabaseError(error: unknown): never {
    const err = ensureError(error);
    throw new InfrastructureError(`Database error: ${err.message}`);
  }
}
