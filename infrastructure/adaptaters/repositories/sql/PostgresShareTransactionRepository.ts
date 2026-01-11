import { Pool } from "pg";
import { ShareTransactionRepository } from "@application/repositories/shareTransaction";
import { ShareTransaction } from "@domain/entities/shareTransaction";
import { ShareTransactionRow } from "@adapters/repositories/types/ShareTransactionRow";
import { InfrastructureError } from "@application/errors";
import { ensureError, ErrorLike } from "@application/utils/errors";

export class PostgresShareTransactionRepository
  implements ShareTransactionRepository
{
  constructor(private readonly pool: Pool) {}

  async save(transaction: ShareTransaction): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO share_transactions (id, share_id, buy_order_id, sell_order_id, buyer_id, seller_id, price_executed, quantity, date_executed, buyer_fee, seller_fee)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          transaction.id,
          transaction.shareId,
          transaction.buyOrderId,
          transaction.sellOrderId,
          transaction.buyerId,
          transaction.sellerId,
          transaction.priceExecuted,
          transaction.quantity,
          transaction.dateExecuted,
          transaction.buyerFee,
          transaction.sellerFee,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<ShareTransaction | null> {
    try {
      const result = await this.pool.query<ShareTransactionRow>(
        `SELECT id, share_id, buy_order_id, sell_order_id, buyer_id, seller_id, price_executed, quantity, date_executed, buyer_fee, seller_fee
                 FROM share_transactions WHERE id = $1`,
        [id]
      );
      return result.rows[0] ? this.mapRowToTransaction(result.rows[0]) : null;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByShareId(shareId: string): Promise<ShareTransaction[]> {
    try {
      const result = await this.pool.query<ShareTransactionRow>(
        `SELECT id, share_id, buy_order_id, sell_order_id, buyer_id, seller_id, price_executed, quantity, date_executed, buyer_fee, seller_fee
                 FROM share_transactions WHERE share_id = $1 ORDER BY date_executed DESC`,
        [shareId]
      );
      return result.rows.map((row) => this.mapRowToTransaction(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByCustomerId(customerId: string): Promise<ShareTransaction[]> {
    try {
      const result = await this.pool.query<ShareTransactionRow>(
        `SELECT id, share_id, buy_order_id, sell_order_id, buyer_id, seller_id, price_executed, quantity, date_executed, buyer_fee, seller_fee
                 FROM share_transactions WHERE buyer_id = $1 OR seller_id = $1 ORDER BY date_executed DESC`,
        [customerId]
      );
      return result.rows.map((row) => this.mapRowToTransaction(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findLastByShareId(shareId: string): Promise<ShareTransaction | null> {
    try {
      const result = await this.pool.query<ShareTransactionRow>(
        `SELECT id, share_id, buy_order_id, sell_order_id, buyer_id, seller_id, price_executed, quantity, date_executed, buyer_fee, seller_fee
                 FROM share_transactions WHERE share_id = $1 ORDER BY date_executed DESC LIMIT 1`,
        [shareId]
      );
      return result.rows[0] ? this.mapRowToTransaction(result.rows[0]) : null;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private mapRowToTransaction(row: ShareTransactionRow): ShareTransaction {
    return new ShareTransaction(
      row.id,
      row.share_id,
      row.buy_order_id,
      row.sell_order_id,
      row.buyer_id,
      row.seller_id,
      row.price_executed,
      row.quantity,
      row.date_executed,
      row.buyer_fee,
      row.seller_fee
    );
  }

  private handleDatabaseError(error: ErrorLike): never {
    const err = ensureError(error);
    throw new InfrastructureError(`Database error: ${err.message}`);
  }
}
