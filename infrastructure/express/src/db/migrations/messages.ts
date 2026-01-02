import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureMessagesTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY,
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'bankAdvisor', 'bankManager')),
        text TEXT NOT NULL,
        send_date TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_send_date ON messages(send_date)
    `);
  } catch (error) {
    console.error("Failed to ensure messages table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
