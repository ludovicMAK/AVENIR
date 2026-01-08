import { Pool } from "pg";
import { ShareRepository } from "@application/repositories/share";
import { Share } from "@domain/entities/share";
import { ShareRow } from "@adapters/repositories/types/ShareRow";
import { InfrastructureError } from "@application/errors";
import { ensureError } from "@application/utils/errors";

export class PostgresShareRepository implements ShareRepository {
  constructor(private readonly pool: Pool) {}

  async save(share: Share): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO shares (id, name, total_number_of_parts, initial_price, last_executed_price)
                 VALUES ($1, $2, $3, $4, $5)`,
        [
          share.id,
          share.name,
          share.totalNumberOfParts,
          share.initialPrice,
          share.lastExecutedPrice,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<Share | null> {
    try {
      const result = await this.pool.query<ShareRow>(
        `SELECT id, name, total_number_of_parts, initial_price, last_executed_price
                 FROM shares WHERE id = $1`,
        [id]
      );
      return result.rows[0] ? this.mapRowToShare(result.rows[0]) : null;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Share[]> {
    try {
      const result = await this.pool.query<ShareRow>(
        `SELECT id, name, total_number_of_parts, initial_price, last_executed_price
                 FROM shares ORDER BY name ASC`
      );
      return result.rows.map((row) => this.mapRowToShare(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByName(name: string): Promise<Share | null> {
    try {
      const result = await this.pool.query<ShareRow>(
        `SELECT id, name, total_number_of_parts, initial_price, last_executed_price
                 FROM shares WHERE LOWER(name) = LOWER($1)`,
        [name]
      );
      return result.rows[0] ? this.mapRowToShare(result.rows[0]) : null;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async updateLastExecutedPrice(shareId: string, price: number): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE shares SET last_executed_price = $1 WHERE id = $2`,
        [price, shareId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async update(share: Share): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE shares 
         SET name = $1, total_number_of_parts = $2, initial_price = $3, last_executed_price = $4
         WHERE id = $5`,
        [
          share.name,
          share.totalNumberOfParts,
          share.initialPrice,
          share.lastExecutedPrice,
          share.id,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async delete(shareId: string): Promise<void> {
    try {
      await this.pool.query(`DELETE FROM shares WHERE id = $1`, [shareId]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private mapRowToShare(row: ShareRow): Share {
    return new Share(
      row.id,
      row.name,
      row.total_number_of_parts,
      row.initial_price,
      row.last_executed_price
    );
  }

  private handleDatabaseError(error: unknown): never {
    const err = ensureError(error);
    throw new InfrastructureError(`Database error: ${err.message}`);
  }
}
