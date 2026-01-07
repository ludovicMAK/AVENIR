import { ensureUsersTable } from "@express/src/db/migrations/users";
import { ensureEmailConfirmationTokensTable } from "@express/src/db/migrations/pendingRegistrations";
import { ensureAccountsTable } from "@express/src/db/migrations/accounts";
import { ensureSharesTable } from "@express/src/db/migrations/shares";
import { ensureOrdersTable } from "@express/src/db/migrations/orders";
import { ensureShareTransactionsTable } from "@express/src/db/migrations/shareTransactions";
import { ensureSecuritiesPositionsTable } from "@express/src/db/migrations/securitiesPositions";
import { ensureTransferTable } from "./migrations/transfer";
import { ensureTransactionsTable } from "./migrations/transaction";
import { ensureSessionsTable } from "./migrations/sessions";
import { ensureConversationsTable } from "./migrations/conversations";
import { ensureMessagesTable } from "./migrations/messages";
import { ensureParticipantConversationsTable } from "./migrations/participantConversations";
import { ensureTransferConversationsTable } from "./migrations/transferConversations";
import { ensureCreditsTable } from "./migrations/credits";
import { ensureDueDatesTable } from "./migrations/dueDates";

export async function ensureSchema(): Promise<void> {
  await ensureUsersTable();
  await ensureSessionsTable();
  await ensureEmailConfirmationTokensTable();
  await ensureAccountsTable();
  await ensureSharesTable();
  await ensureOrdersTable();
  await ensureShareTransactionsTable();
  await ensureSecuritiesPositionsTable();
  await ensureTransferTable();
  await ensureTransactionsTable();
  await ensureConversationsTable();
  await ensureMessagesTable();
  await ensureParticipantConversationsTable();
  await ensureTransferConversationsTable();
  await ensureCreditsTable();
  await ensureDueDatesTable();
}
