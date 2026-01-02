import { Pool } from "pg";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { ParticipantConversation } from "@domain/entities/participantConversation";
import { InfrastructureError } from "@application/errors";
import { ensureError } from "@application/utils/errors";

interface ParticipantConversationRow {
  id: string;
  conversation_id: string;
  advisor_id: string;
  date_added: Date;
  date_end: Date | null;
  est_principal: boolean;
}

export class PostgresParticipantConversationRepository
  implements ParticipantConversationRepository
{
  constructor(private readonly pool: Pool) {}

  async save(participant: ParticipantConversation): Promise<void> {
    try {
      await this.pool.query(
        `
          INSERT INTO participant_conversations (id, conversation_id, advisor_id, date_added, date_end, est_principal)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          participant.id,
          participant.conversationId,
          participant.advisorId,
          participant.dateAdded,
          participant.dateEnd,
          participant.estPrincipal,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<ParticipantConversation | null> {
    try {
      const result = await this.pool.query<ParticipantConversationRow>(
        `
          SELECT id, conversation_id, advisor_id, date_added, date_end, est_principal
          FROM participant_conversations
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        return null;
      }

      return this.mapRowToParticipant(result.rows[0]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByConversationId(
    conversationId: string
  ): Promise<ParticipantConversation[]> {
    try {
      const result = await this.pool.query<ParticipantConversationRow>(
        `
          SELECT id, conversation_id, advisor_id, date_added, date_end, est_principal
          FROM participant_conversations
          WHERE conversation_id = $1
          ORDER BY date_added ASC
        `,
        [conversationId]
      );

      return result.rows.map((row) => this.mapRowToParticipant(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findActiveByConversationId(
    conversationId: string
  ): Promise<ParticipantConversation[]> {
    try {
      const result = await this.pool.query<ParticipantConversationRow>(
        `
          SELECT id, conversation_id, advisor_id, date_added, date_end, est_principal
          FROM participant_conversations
          WHERE conversation_id = $1 AND date_end IS NULL
          ORDER BY date_added ASC
        `,
        [conversationId]
      );

      return result.rows.map((row) => this.mapRowToParticipant(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByAdvisorId(advisorId: string): Promise<ParticipantConversation[]> {
    try {
      const result = await this.pool.query<ParticipantConversationRow>(
        `
          SELECT id, conversation_id, advisor_id, date_added, date_end, est_principal
          FROM participant_conversations
          WHERE advisor_id = $1
          ORDER BY date_added DESC
        `,
        [advisorId]
      );

      return result.rows.map((row) => this.mapRowToParticipant(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByConversationIdAndAdvisorId(
    conversationId: string,
    advisorId: string
  ): Promise<ParticipantConversation | null> {
    try {
      const result = await this.pool.query<ParticipantConversationRow>(
        `
          SELECT id, conversation_id, advisor_id, date_added, date_end, est_principal
          FROM participant_conversations
          WHERE conversation_id = $1 AND advisor_id = $2
          LIMIT 1
        `,
        [conversationId, advisorId]
      );

      if (result.rowCount === 0) {
        return null;
      }

      return this.mapRowToParticipant(result.rows[0]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findPrincipalByConversationId(
    conversationId: string
  ): Promise<ParticipantConversation | null> {
    try {
      const result = await this.pool.query<ParticipantConversationRow>(
        `
          SELECT id, conversation_id, advisor_id, date_added, date_end, est_principal
          FROM participant_conversations
          WHERE conversation_id = $1 AND est_principal = true
          LIMIT 1
        `,
        [conversationId]
      );

      if (result.rowCount === 0) {
        return null;
      }

      return this.mapRowToParticipant(result.rows[0]);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async updateDateEnd(participantId: string, dateEnd: Date): Promise<void> {
    try {
      await this.pool.query(
        `
          UPDATE participant_conversations
          SET date_end = $1
          WHERE id = $2
        `,
        [dateEnd, participantId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async delete(participantId: string): Promise<void> {
    try {
      await this.pool.query(
        `
          DELETE FROM participant_conversations
          WHERE id = $1
        `,
        [participantId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private mapRowToParticipant(
    row: ParticipantConversationRow
  ): ParticipantConversation {
    return new ParticipantConversation(
      row.id,
      row.conversation_id,
      row.advisor_id,
      row.date_added,
      row.date_end,
      row.est_principal
    );
  }

  private handleDatabaseError(unknownError: unknown): never {
    const error = ensureError(unknownError, "Unexpected database error");
    console.error("Database operation failed", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
