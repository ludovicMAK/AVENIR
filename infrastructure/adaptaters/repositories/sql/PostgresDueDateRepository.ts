import { Pool } from "pg";
import { DueDateRepository } from "@application/repositories/dueDate";
import { InfrastructureError } from "@application/errors";
import { ensureError } from "@application/utils/errors";
import { DueDate } from "@domain/entities/dueDate";
import { DueDateRow } from "../types/DueDateRow";
import { DueDateStatus } from "@domain/values/dueDateStatus";
import { PostgresUnitOfWork } from "@adapters/services/PostgresUnitOfWork";

export class PostgresDueDateRepository implements DueDateRepository {
  constructor(private readonly pool: Pool) {}

  async save(dueDate: DueDate, unitOfWork?: PostgresUnitOfWork): Promise<void> {
    try {
      const client = unitOfWork instanceof PostgresUnitOfWork ? unitOfWork.getClient() : null;
      const executor: any = client || this.pool;

      await executor.query(
        `
          INSERT INTO due_dates (id, due_date, total_amount, share_interest, share_insurance, repayment_portion, status, credit_id, payment_date, transfer_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        [
          dueDate.id,
          dueDate.dueDate,
          dueDate.totalAmount,
          dueDate.shareInterest,
          dueDate.shareInsurance,
          dueDate.repaymentPortion,
          dueDate.status.getValue(),
          dueDate.creditId,
          dueDate.paymentDate || null,
          dueDate.transferId || null,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<DueDate | null> {
    try {
      const result = await this.pool.query<DueDateRow>(
        `
          SELECT id, due_date, total_amount, share_interest, share_insurance, repayment_portion, status, credit_id, payment_date, transfer_id
          FROM due_dates
          WHERE id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.rowToDueDate(result.rows[0]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByCreditId(creditId: string): Promise<DueDate[]> {
    try {
      const result = await this.pool.query<DueDateRow>(
        `
          SELECT id, due_date, total_amount, share_interest, share_insurance, repayment_portion, status, credit_id, payment_date, transfer_id
          FROM due_dates
          WHERE credit_id = $1
          ORDER BY due_date ASC
        `,
        [creditId]
      );

      return result.rows.map((row) => this.rowToDueDate(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByStatus(status: string): Promise<DueDate[]> {
    try {
      const result = await this.pool.query<DueDateRow>(
        `
          SELECT id, due_date, total_amount, share_interest, share_insurance, repayment_portion, status, credit_id, payment_date, transfer_id
          FROM due_dates
          WHERE status = $1
          ORDER BY due_date ASC
        `,
        [status]
      );

      return result.rows.map((row) => this.rowToDueDate(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findOverdue(): Promise<DueDate[]> {
    try {
      const result = await this.pool.query<DueDateRow>(
        `
          SELECT id, due_date, total_amount, share_interest, share_insurance, repayment_portion, status, credit_id, payment_date, transfer_id
          FROM due_dates
          WHERE status = $1 AND due_date < CURRENT_TIMESTAMP
          ORDER BY due_date ASC
        `,
        [DueDateStatus.OVERDUE.getValue()]
      );

      return result.rows.map((row) => this.rowToDueDate(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async update(dueDate: DueDate, unitOfWork?: PostgresUnitOfWork): Promise<void> {
    try {
      const client = unitOfWork instanceof PostgresUnitOfWork ? unitOfWork.getClient() : null;
      const executor: any = client || this.pool;

      await executor.query(
        `
          UPDATE due_dates
          SET due_date = $2, total_amount = $3, share_interest = $4, share_insurance = $5, repayment_portion = $6, status = $7, credit_id = $8, payment_date = $9, transfer_id = $10, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [
          dueDate.id,
          dueDate.dueDate,
          dueDate.totalAmount,
          dueDate.shareInterest,
          dueDate.shareInsurance,
          dueDate.repaymentPortion,
          dueDate.status.getValue(),
          dueDate.creditId,
          dueDate.paymentDate || null,
          dueDate.transferId || null,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async delete(dueDateId: string): Promise<void> {
    try {
      await this.pool.query(
        `
          DELETE FROM due_dates
          WHERE id = $1
        `,
        [dueDateId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private rowToDueDate(row: DueDateRow): DueDate {
    return new DueDate(
      row.id,
      new Date(row.due_date),
      row.total_amount,
      row.share_interest,
      row.share_insurance,
      row.repayment_portion,
      DueDateStatus.from(row.status),
      row.credit_id,
      row.payment_date ? new Date(row.payment_date) : undefined,
      row.transfer_id || undefined
    );
  }

  private handleDatabaseError(error: unknown): never {
    const err = ensureError(error);
    throw new InfrastructureError(`Database error: ${err.message}`);
  }
}
