import { ensureUsersTable } from "@express/src/db/migrations/users"
import { ensureEmailConfirmationTokensTable } from "@express/src/db/migrations/pendingRegistrations"

export async function ensureSchema(): Promise<void> {
    await ensureUsersTable()
    await ensureEmailConfirmationTokensTable()
}