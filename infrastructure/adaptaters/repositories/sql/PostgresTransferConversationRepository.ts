import { Pool } from "pg";
import { TransferConversationRepository } from "@application/repositories/transferConversation";
import { TransferConversation } from "@domain/entities/transferConversation";
import { InfrastructureError } from "@application/errors";
import { ensureError, ErrorLike } from "@application/utils/errors";

interface TransferConversationRow {
  id: string;
  conversation_id: string;
  from_advisor_id: string;
  to_advisor_id: string;
  reason: string;
  transfer_date: Date;
}

export class PostgresTransferConversationRepository
  implements TransferConversationRepository
{
  constructor(private readonly pool: Pool) {}

  async save(transfer: TransferConversation): Promise<void> {
    try {
      await this.pool.query(
        `
          INSERT INTO transfer_conversations (id, conversation_id, from_advisor_id, to_advisor_id, reason, transfer_date)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          transfer.id,
          transfer.conversationId,
          transfer.fromAdvisorId,
          transfer.toAdvisorId,
          transfer.reason,
          transfer.transferDate,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<TransferConversation | null> {
    try {
      const result = await this.pool.query<TransferConversationRow>(
        `
          SELECT id, conversation_id, from_advisor_id, to_advisor_id, reason, transfer_date
          FROM transfer_conversations
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        return null;
      }

      return this.mapRowToTransfer(result.rows[0]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByConversationId(
    conversationId: string
  ): Promise<TransferConversation[]> {
    try {
      const result = await this.pool.query<TransferConversationRow>(
        `
          SELECT id, conversation_id, from_advisor_id, to_advisor_id, reason, transfer_date
          FROM transfer_conversations
          WHERE conversation_id = $1
        `,
        [conversationId]
      );

      return result.rows.map((row) => this.mapRowToTransfer(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByFromAdvisorId(
    fromAdvisorId: string
  ): Promise<TransferConversation[]> {
    try {
      const result = await this.pool.query<TransferConversationRow>(
        `
          SELECT id, conversation_id, from_advisor_id, to_advisor_id, reason, transfer_date
          FROM transfer_conversations
          WHERE from_advisor_id = $1
          ORDER BY transfer_date DESC
        `,
        [fromAdvisorId]
      );

      return result.rows.map((row) => this.mapRowToTransfer(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByToAdvisorId(
    toAdvisorId: string
  ): Promise<TransferConversation[]> {
    try {
      const result = await this.pool.query<TransferConversationRow>(
        `
          SELECT id, conversation_id, from_advisor_id, to_advisor_id, reason, transfer_date
          FROM transfer_conversations
          WHERE to_advisor_id = $1
          ORDER BY transfer_date DESC
        `,
        [toAdvisorId]
      );

      return result.rows.map((row) => this.mapRowToTransfer(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByConversationIdOrderByDate(
    conversationId: string
  ): Promise<TransferConversation[]> {
    try {
      const result = await this.pool.query<TransferConversationRow>(
        `
          SELECT id, conversation_id, from_advisor_id, to_advisor_id, reason, transfer_date
          FROM transfer_conversations
          WHERE conversation_id = $1
          ORDER BY transfer_date ASC
        `,
        [conversationId]
      );

      return result.rows.map((row) => this.mapRowToTransfer(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async delete(transferId: string): Promise<void> {
    try {
      await this.pool.query(
        `
          DELETE FROM transfer_conversations
          WHERE id = $1
        `,
        [transferId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private mapRowToTransfer(row: TransferConversationRow): TransferConversation {
    return new TransferConversation(
      row.id,
      row.conversation_id,
      row.from_advisor_id,
      row.to_advisor_id,
      row.reason,
      row.transfer_date
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
