import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureTransferConversationsTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS transfer_conversations (
        id UUID PRIMARY KEY,
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        from_advisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        to_advisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        transfer_date TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transfer_conversations_conversation_id ON transfer_conversations(conversation_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transfer_conversations_from_advisor_id ON transfer_conversations(from_advisor_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transfer_conversations_to_advisor_id ON transfer_conversations(to_advisor_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transfer_conversations_transfer_date ON transfer_conversations(transfer_date)
    `);
  } catch (error) {
    console.error("Failed to ensure transfer_conversations table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
