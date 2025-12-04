import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureSecuritiesPositionsTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS securities_positions (
                id UUID PRIMARY KEY,
                customer_id UUID NOT NULL,
                share_id UUID NOT NULL,
                total_quantity INTEGER NOT NULL DEFAULT 0,
                blocked_quantity INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (customer_id) REFERENCES users(id),
                FOREIGN KEY (share_id) REFERENCES shares(id),
                UNIQUE(customer_id, share_id)
            )
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_securities_positions_customer_id ON securities_positions(customer_id)
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_securities_positions_share_id ON securities_positions(share_id)
        `);
  } catch (error) {
    console.error("Failed to ensure securities_positions table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
