import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureShareTransactionsTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS share_transactions (
                id UUID PRIMARY KEY,
                share_id UUID NOT NULL,
                buy_order_id UUID NOT NULL,
                sell_order_id UUID NOT NULL,
                buyer_id UUID NOT NULL,
                seller_id UUID NOT NULL,
                price_executed INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                date_executed TIMESTAMP NOT NULL,
                buyer_fee INTEGER NOT NULL DEFAULT 100,
                seller_fee INTEGER NOT NULL DEFAULT 100,
                FOREIGN KEY (share_id) REFERENCES shares(id),
                FOREIGN KEY (buy_order_id) REFERENCES orders(id),
                FOREIGN KEY (sell_order_id) REFERENCES orders(id),
                FOREIGN KEY (buyer_id) REFERENCES users(id),
                FOREIGN KEY (seller_id) REFERENCES users(id)
            )
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_share_transactions_share_id ON share_transactions(share_id)
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_share_transactions_buyer_id ON share_transactions(buyer_id)
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_share_transactions_seller_id ON share_transactions(seller_id)
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_share_transactions_date_executed ON share_transactions(date_executed DESC)
        `);
  } catch (error) {
    console.error("Failed to ensure share_transactions table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
