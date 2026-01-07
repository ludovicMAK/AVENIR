import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureCreditsTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS credits (
        id UUID PRIMARY KEY,
        amount_borrowed BIGINT NOT NULL,
        annual_rate DECIMAL(5, 2) NOT NULL,
        insurance_rate DECIMAL(5, 2) NOT NULL,
        duration_in_months INTEGER NOT NULL,
        start_date TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL,
        customer_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_credits_customer_id ON credits(customer_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_credits_status ON credits(status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_credits_start_date ON credits(start_date)
    `);

  } catch (error) {
    console.error("Failed to ensure credits table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
