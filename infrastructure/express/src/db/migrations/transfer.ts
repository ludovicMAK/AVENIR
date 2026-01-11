import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureTransferTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
      DO $$ BEGIN
        
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_transfer') THEN
          CREATE TYPE status_transfer AS ENUM ('pending', 'validated', 'cancelled');
        END IF;
      END $$;
            CREATE TABLE IF NOT EXISTS transfers (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                amount NUMERIC(10,2) NOT NULL,
                date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date_executed TIMESTAMP,
                description TEXT,
                status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'cancelled')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
  } catch (error) {
    console.error("Failed to ensure transfer table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
