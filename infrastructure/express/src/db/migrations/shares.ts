import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureSharesTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS shares (
                id UUID PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                total_number_of_parts INTEGER NOT NULL,
                initial_price INTEGER NOT NULL,
                last_executed_price INTEGER
            )
        `);
  } catch (error) {
    console.error("Failed to ensure shares table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
