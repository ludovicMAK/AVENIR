import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureDailyInterestsTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credit_mode') THEN
          CREATE TYPE credit_mode AS ENUM ('daily', 'monthly');
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS daily_interests (
        id UUID PRIMARY KEY,
        date DATE NOT NULL,
        calculation_base BIGINT NOT NULL,
        applied_rate NUMERIC(6,4) NOT NULL,
        calculated_interest BIGINT NOT NULL,
        credit_mode credit_mode NOT NULL,
        account_id UUID NOT NULL REFERENCES accounts(id),
        transaction_id UUID NULL REFERENCES transactions(id)
      );

      CREATE INDEX IF NOT EXISTS idx_daily_interests_account_date ON daily_interests(account_id, date DESC);
    `);
  } catch (error) {
    console.error("Failed to ensure daily_interests table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
