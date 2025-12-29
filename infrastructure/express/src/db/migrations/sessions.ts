import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureSessionsTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                refresh_token_hash TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                last_active_at TIMESTAMP DEFAULT NOW()
            )
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
        `);

    
  } catch (error) {
    console.error("Failed to ensure orders table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
