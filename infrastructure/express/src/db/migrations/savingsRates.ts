import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureSavingsRatesTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS savings_rates (
        id UUID PRIMARY KEY,
        rate NUMERIC(6,4) NOT NULL,
        date_effect TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_savings_rates_date_effect ON savings_rates(date_effect DESC);
    `);
  } catch (error) {
    console.error("Failed to ensure savings_rates table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
