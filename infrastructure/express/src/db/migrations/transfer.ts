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
            CREATE TABLE IF NOT EXISTS transfer (
                id UUID PRIMARY KEY,
                amount int NOT NULL,
                date_requested TIMESTAMP NOT NULL,
                date_executed TIMESTAMP NOT NULL,
                description text NOT NULL,
                status status_transfer NOT NULL
            )
        `);

    
  } catch (error) {
    console.error("Failed to ensure transfer table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
