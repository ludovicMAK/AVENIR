import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureTransactionsTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_direction') THEN
          CREATE TYPE transaction_direction AS ENUM ('debit', 'credit');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_transaction') THEN
          CREATE TYPE status_transaction AS ENUM ('posted', 'validated');
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS transactions (
          id UUID PRIMARY KEY,
          account_iban VARCHAR NOT NULL,
          transaction_direction transaction_direction NOT NULL,
          amount int NOT NULL,
          reason TEXT NOT NULL,
          account_date TIMESTAMP NOT NULL,
          status status_transaction NOT NULL,
          transfer_id UUID NULL
      );
    `);

    await client.query(`
      ALTER TABLE transactions
      ALTER COLUMN transfer_id DROP NOT NULL;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_transfer_id ON transactions(transfer_id)
    `);
  } catch (error) {
    console.error("Failed to ensure transactions table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
