import { Pool } from "pg";
import { MessageRepository } from "@application/repositories/message";
import { Message } from "@domain/entities/message";
import { InfrastructureError } from "@application/errors";
import { ensureError, ErrorLike } from "@application/utils/errors";

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: string;
  text: string;
  send_date: Date;
}

export class PostgresMessageRepository implements MessageRepository {
  constructor(private readonly pool: Pool) {}

  async save(message: Message): Promise<void> {
    try {
      await this.pool.query(
        `
          INSERT INTO messages (id, conversation_id, sender_id, sender_role, text, send_date)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          message.id,
          message.conversationId,
          message.senderId,
          message.senderRole,
          message.text,
          message.sendDate,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<Message | null> {
    try {
      const result = await this.pool.query<MessageRow>(
        `
          SELECT id, conversation_id, sender_id, sender_role, text, send_date
          FROM messages
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        return null;
      }

      return this.mapRowToMessage(result.rows[0]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByConversationId(conversationId: string): Promise<Message[]> {
    try {
      const result = await this.pool.query<MessageRow>(
        `
          SELECT id, conversation_id, sender_id, sender_role, text, send_date
          FROM messages
          WHERE conversation_id = $1
        `,
        [conversationId]
      );

      return result.rows.map((row) => this.mapRowToMessage(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findBySenderId(senderId: string): Promise<Message[]> {
    try {
      const result = await this.pool.query<MessageRow>(
        `
          SELECT id, conversation_id, sender_id, sender_role, text, send_date
          FROM messages
          WHERE sender_id = $1
          ORDER BY send_date DESC
        `,
        [senderId]
      );

      return result.rows.map((row) => this.mapRowToMessage(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByConversationIdOrderByDate(
    conversationId: string
  ): Promise<Message[]> {
    try {
      const result = await this.pool.query<MessageRow>(
        `
          SELECT id, conversation_id, sender_id, sender_role, text, send_date
          FROM messages
          WHERE conversation_id = $1
          ORDER BY send_date ASC
        `,
        [conversationId]
      );

      return result.rows.map((row) => this.mapRowToMessage(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async delete(messageId: string): Promise<void> {
    try {
      await this.pool.query(
        `
          DELETE FROM messages
          WHERE id = $1
        `,
        [messageId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private mapRowToMessage(row: MessageRow): Message {
    return new Message(
      row.id,
      row.conversation_id,
      row.sender_id,
      row.sender_role,
      row.text,
      row.send_date
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
