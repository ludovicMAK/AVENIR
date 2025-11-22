import { ensureUsersTable } from "@express/src/db/migrations/users"

export async function ensureSchema(): Promise<void> {
    await ensureUsersTable()
}