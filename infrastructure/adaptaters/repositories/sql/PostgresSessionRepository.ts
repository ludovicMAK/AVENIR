import { Pool } from "pg";
import { SecuritiesPositionRepository } from "@application/repositories/securitiesPosition";
import { SecuritiesPosition } from "@domain/entities/securitiesPosition";
import { SecuritiesPositionRow } from "@adapters/repositories/types/SecuritiesPositionRow";
import { InfrastructureError } from "@application/errors";
import { ensureError } from "@application/utils/errors";
import { User } from "@domain/entities/users";
import { Session } from "@domain/entities/session";
import { SessionRepository } from "@application/repositories/session";

export class PostgresSessionRepository implements SessionRepository {
  constructor(private readonly pool: Pool) {}

  async createSession(session: Session): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at, created_at)
                 VALUES ($1, $2, $3, $4, $5)`,
        [
          session.id,
          session.userId,
          session.refreshToken,
          session.expirationAt,
          session.createdAt,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }
  async isConnected(userId: string, token: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `SELECT COUNT(*) as count FROM sessions WHERE user_id = $1 AND refresh_token_hash = $2 AND expires_at > NOW()`,
        [userId, token]
      );

      const rawCount = result.rows[0].count;

      const count = parseInt(rawCount, 10);
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async getUserIdByToken(token: string): Promise<string | null> {
    try {
      const result = await this.pool.query(
        `SELECT user_id FROM sessions WHERE refresh_token_hash = $1 AND expires_at > NOW() LIMIT 1`,
        [token]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0].user_id;
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
