import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureTransferTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS transfer (
                id UUID PRIMARY KEY,
                amount int NOT NULL,
                date_requested TIMESTAMP NOT NULL,
                date_executed TIMESTAMP NOT NULL,
                description text NOT NULL
            )
        `);

    
  } catch (error) {
    console.error("Failed to ensure transfer table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
