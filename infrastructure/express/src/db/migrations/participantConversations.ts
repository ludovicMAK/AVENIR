import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureParticipantConversationsTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS participant_conversations (
        id UUID PRIMARY KEY,
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        advisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date_added TIMESTAMP NOT NULL DEFAULT NOW(),
        date_end TIMESTAMP NULL,
        est_principal BOOLEAN NOT NULL DEFAULT false
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_participant_conversations_conversation_id ON participant_conversations(conversation_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_participant_conversations_advisor_id ON participant_conversations(advisor_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_participant_conversations_active ON participant_conversations(conversation_id, advisor_id) WHERE date_end IS NULL
    `);
  } catch (error) {
    console.error("Failed to ensure participant_conversations table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
