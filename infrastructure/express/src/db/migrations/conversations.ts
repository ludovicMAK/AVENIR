import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureConversationsTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY,
        subject TEXT NOT NULL DEFAULT 'Conversation',
        status TEXT NOT NULL CHECK (status IN ('open', 'transferred', 'closed')),
        type TEXT NOT NULL DEFAULT 'PRIVATE' CHECK (type IN ('PRIVATE', 'GROUP')),
        date_ouverture TIMESTAMP NOT NULL DEFAULT NOW(),
        customer_id UUID REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      ALTER TABLE conversations
      ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT 'Conversation'
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type)
    `);
  } catch (error) {
    console.error("Failed to ensure conversations table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
