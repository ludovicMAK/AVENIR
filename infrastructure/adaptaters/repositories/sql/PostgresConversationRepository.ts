import { Pool } from "pg";
import { ConversationRepository } from "@application/repositories/conversation";
import { Conversation } from "@domain/entities/conversation";
import { ConversationStatus } from "@domain/values/conversationStatus";
import { ConversationType } from "@domain/values/conversationType";
import { InfrastructureError } from "@application/errors";
import { ensureError, ErrorLike } from "@application/utils/errors";

interface ConversationRow {
  id: string;
  status: string;
  type: string;
  date_ouverture: Date;
  customer_id: string | null;
}

export class PostgresConversationRepository implements ConversationRepository {
  constructor(private readonly pool: Pool) {}

  async save(conversation: Conversation): Promise<void> {
    try {
      await this.pool.query(
        `
          INSERT INTO conversations (id, status, type, date_ouverture, customer_id)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          conversation.id,
          conversation.status.toString(),
          conversation.type.toString().toLowerCase(),
          conversation.dateOuverture,
          conversation.customerId,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<Conversation | null> {
    try {
      const result = await this.pool.query<ConversationRow>(
        `
          SELECT id, status, type, date_ouverture, customer_id
          FROM conversations
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        return null;
      }

      return this.mapRowToConversation(result.rows[0]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByCustomerId(customerId: string): Promise<Conversation[]> {
    try {
      const result = await this.pool.query<ConversationRow>(
        `
          SELECT id, status, type, date_ouverture, customer_id
          FROM conversations
          WHERE customer_id = $1
          ORDER BY date_ouverture DESC
        `,
        [customerId]
      );

      return result.rows.map((row) => this.mapRowToConversation(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByStatus(status: ConversationStatus): Promise<Conversation[]> {
    try {
      const result = await this.pool.query<ConversationRow>(
        `
          SELECT id, status, type, date_ouverture, customer_id
          FROM conversations
          WHERE status = $1
          ORDER BY date_ouverture DESC
        `,
        [status.toString()]
      );

      return result.rows.map((row) => this.mapRowToConversation(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async updateStatus(
    conversationId: string,
    status: ConversationStatus
  ): Promise<void> {
    try {
      await this.pool.query(
        `
          UPDATE conversations
          SET status = $1
          WHERE id = $2
        `,
        [status.toString(), conversationId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async delete(conversationId: string): Promise<void> {
    try {
      await this.pool.query(
        `
          DELETE FROM conversations
          WHERE id = $1
        `,
        [conversationId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private mapRowToConversation(row: ConversationRow): Conversation {
    return new Conversation(
      row.id,
      ConversationStatus.from(row.status),
      ConversationType.fromString(row.type),
      row.date_ouverture,
      row.customer_id
    );
  }

  private handleDatabaseError(unknownError: ErrorLike): never {
    const error = ensureError(unknownError, "Unexpected database error");
    console.error("Database operation failed", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
