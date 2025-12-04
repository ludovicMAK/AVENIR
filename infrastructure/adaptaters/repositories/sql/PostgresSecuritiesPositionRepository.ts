import { Pool } from "pg";
import { SecuritiesPositionRepository } from "@application/repositories/securitiesPosition";
import { SecuritiesPosition } from "@domain/entities/securitiesPosition";
import { SecuritiesPositionRow } from "@adapters/repositories/types/SecuritiesPositionRow";
import { InfrastructureError } from "@application/errors";
import { ensureError } from "@application/utils/errors";

export class PostgresSecuritiesPositionRepository
  implements SecuritiesPositionRepository
{
  constructor(private readonly pool: Pool) {}

  async save(position: SecuritiesPosition): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO securities_positions (id, customer_id, share_id, total_quantity, blocked_quantity)
                 VALUES ($1, $2, $3, $4, $5)`,
        [
          position.id,
          position.customerId,
          position.shareId,
          position.totalQuantity,
          position.blockedQuantity,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<SecuritiesPosition | null> {
    try {
      const result = await this.pool.query<SecuritiesPositionRow>(
        `SELECT id, customer_id, share_id, total_quantity, blocked_quantity
                 FROM securities_positions WHERE id = $1`,
        [id]
      );
      return result.rows[0] ? this.mapRowToPosition(result.rows[0]) : null;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByCustomerId(customerId: string): Promise<SecuritiesPosition[]> {
    try {
      const result = await this.pool.query<SecuritiesPositionRow>(
        `SELECT id, customer_id, share_id, total_quantity, blocked_quantity
                 FROM securities_positions WHERE customer_id = $1`,
        [customerId]
      );
      return result.rows.map((row) => this.mapRowToPosition(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByCustomerIdAndShareId(
    customerId: string,
    shareId: string
  ): Promise<SecuritiesPosition | null> {
    try {
      const result = await this.pool.query<SecuritiesPositionRow>(
        `SELECT id, customer_id, share_id, total_quantity, blocked_quantity
                 FROM securities_positions WHERE customer_id = $1 AND share_id = $2`,
        [customerId, shareId]
      );
      return result.rows[0] ? this.mapRowToPosition(result.rows[0]) : null;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async updateQuantities(
    positionId: string,
    totalQuantity: number,
    blockedQuantity: number
  ): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE securities_positions SET total_quantity = $1, blocked_quantity = $2 WHERE id = $3`,
        [totalQuantity, blockedQuantity, positionId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async delete(positionId: string): Promise<void> {
    try {
      await this.pool.query(`DELETE FROM securities_positions WHERE id = $1`, [
        positionId,
      ]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private mapRowToPosition(row: SecuritiesPositionRow): SecuritiesPosition {
    return new SecuritiesPosition(
      row.id,
      row.customer_id,
      row.share_id,
      row.total_quantity,
      row.blocked_quantity
    );
  }

  private handleDatabaseError(error: unknown): never {
    const err = ensureError(error);
    throw new InfrastructureError(`Database error: ${err.message}`);
  }
}
