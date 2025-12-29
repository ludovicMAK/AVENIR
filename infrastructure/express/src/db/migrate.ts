import { ensureUsersTable } from "@express/src/db/migrations/users";
import { ensureEmailConfirmationTokensTable } from "@express/src/db/migrations/pendingRegistrations";
import { ensureAccountsTable } from "@express/src/db/migrations/accounts";
import { ensureSharesTable } from "@express/src/db/migrations/shares";
import { ensureOrdersTable } from "@express/src/db/migrations/orders";
import { ensureShareTransactionsTable } from "@express/src/db/migrations/shareTransactions";
import { ensureSecuritiesPositionsTable } from "@express/src/db/migrations/securitiesPositions";
import { ensureTransferTable } from "./migrations/transfer";
import { ensureTransactionsTable } from "./migrations/transaction";

export async function ensureSchema(): Promise<void> {
  await ensureUsersTable();
  await ensureEmailConfirmationTokensTable();
  await ensureAccountsTable();
  await ensureSharesTable();
  await ensureOrdersTable();
  await ensureShareTransactionsTable();
  await ensureSecuritiesPositionsTable();
  await ensureTransferTable();
  await ensureTransactionsTable();
}
