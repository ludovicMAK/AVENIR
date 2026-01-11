import { Pool } from "pg";
import { OrderRepository } from "@application/repositories/order";
import { Order } from "@domain/entities/order";
import { OrderDirection } from "@domain/values/orderDirection";
import { OrderValidity } from "@domain/values/orderValidity";
import { OrderStatus } from "@domain/values/orderStatus";
import { OrderRow } from "@adapters/repositories/types/OrderRow";
import { InfrastructureError } from "@application/errors";
import { ensureError, ErrorLike } from "@application/utils/errors";

export class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly pool: Pool) {}

  async save(order: Order): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO orders (id, customer_id, share_id, direction, quantity, price_limit, validity, status, date_captured, blocked_amount)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          order.id,
          order.customerId,
          order.shareId,
          order.direction,
          order.quantity,
          order.priceLimit,
          order.validity,
          order.status,
          order.dateCaptured,
          order.blockedAmount,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<Order | null> {
    try {
      const result = await this.pool.query<OrderRow>(
        `SELECT id, customer_id, share_id, direction, quantity, price_limit, validity, status, date_captured, blocked_amount
                 FROM orders WHERE id = $1`,
        [id]
      );
      return result.rows[0] ? this.mapRowToOrder(result.rows[0]) : null;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    try {
      const result = await this.pool.query<OrderRow>(
        `SELECT id, customer_id, share_id, direction, quantity, price_limit, validity, status, date_captured, blocked_amount
                 FROM orders WHERE customer_id = $1 ORDER BY date_captured DESC`,
        [customerId]
      );
      return result.rows.map((row) => this.mapRowToOrder(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByShareId(shareId: string): Promise<Order[]> {
    try {
      const result = await this.pool.query<OrderRow>(
        `SELECT id, customer_id, share_id, direction, quantity, price_limit, validity, status, date_captured, blocked_amount
                 FROM orders WHERE share_id = $1 ORDER BY date_captured DESC`,
        [shareId]
      );
      return result.rows.map((row) => this.mapRowToOrder(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findActiveByShareId(shareId: string): Promise<Order[]> {
    try {
      const result = await this.pool.query<OrderRow>(
        `SELECT id, customer_id, share_id, direction, quantity, price_limit, validity, status, date_captured, blocked_amount
                 FROM orders WHERE share_id = $1 AND status = $2 ORDER BY date_captured ASC`,
        [shareId, OrderStatus.ACTIVE]
      );
      return result.rows.map((row) => this.mapRowToOrder(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findActiveByShareIdAndDirection(
    shareId: string,
    direction: OrderDirection
  ): Promise<Order[]> {
    try {
      const result = await this.pool.query<OrderRow>(
        `SELECT id, customer_id, share_id, direction, quantity, price_limit, validity, status, date_captured, blocked_amount
                 FROM orders WHERE share_id = $1 AND direction = $2 AND status = $3 ORDER BY price_limit ${
                   direction === OrderDirection.BUY ? "DESC" : "ASC"
                 }, date_captured ASC`,
        [shareId, direction, OrderStatus.ACTIVE]
      );
      return result.rows.map((row) => this.mapRowToOrder(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await this.pool.query(`UPDATE orders SET status = $1 WHERE id = $2`, [
        status,
        orderId,
      ]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async updateBlockedAmount(orderId: string, amount: number): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE orders SET blocked_amount = $1 WHERE id = $2`,
        [amount, orderId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private mapRowToOrder(row: OrderRow): Order {
    return new Order(
      row.id,
      row.customer_id,
      row.share_id,
      row.direction as OrderDirection,
      row.quantity,
      row.price_limit,
      row.validity as OrderValidity,
      row.status as OrderStatus,
      row.date_captured,
      row.blocked_amount
    );
  }

  private handleDatabaseError(error: ErrorLike): never {
    const err = ensureError(error);
    throw new InfrastructureError(`Database error: ${err.message}`);
  }
}
