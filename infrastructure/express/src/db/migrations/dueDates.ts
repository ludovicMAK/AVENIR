import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureDueDatesTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS due_dates (
        id UUID PRIMARY KEY,
        due_date TIMESTAMP NOT NULL,
        total_amount BIGINT NOT NULL,
        share_interest BIGINT NOT NULL,
        share_insurance BIGINT NOT NULL,
        repayment_portion BIGINT NOT NULL,
        status VARCHAR(50) NOT NULL,
        credit_id UUID NOT NULL,
        payment_date TIMESTAMP,
        transfer_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (credit_id) REFERENCES credits(id) ON DELETE CASCADE,
        FOREIGN KEY (transfer_id) REFERENCES transfers(id) ON DELETE SET NULL
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_due_dates_credit_id ON due_dates(credit_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_due_dates_status ON due_dates(status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_due_dates_due_date ON due_dates(due_date)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_due_dates_transfer_id ON due_dates(transfer_id)
    `);

  } catch (error) {
    console.error("Failed to ensure due_dates table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
