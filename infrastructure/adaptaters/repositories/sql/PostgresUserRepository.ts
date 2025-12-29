import { Pool } from "pg"

import { UserRepository } from "@application/repositories/users"
import { User } from "@domain/entities/users"
import { InfrastructureError } from "@application/errors"
import { ensureError } from "@application/utils/errors"
import { Role } from "@domain/values/role"
import { UserRow } from "@adapters/repositories/types/UserRow"
import { UserInfoConnected } from "@domain/values/userInfoConnected"

export class PostgresUserRepository implements UserRepository {
    constructor(private readonly pool: Pool) {}

    async save(user: User): Promise<void> {
        try {
            await this.pool.query(
                `
                    INSERT INTO users (id, lastname, firstname, email, role, password, status, email_verified_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `,
                [
                    user.id,
                    user.lastname,
                    user.firstname,
                    user.email.toLowerCase(),
                    user.role.getValue(),
                    user.password,
                    user.status,
                    user.emailVerifiedAt,
                ],
            )
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }

    async findAll(): Promise<User[]> {
        try {
            const result = await this.pool.query<UserRow>(
                `
                    SELECT id, lastname, firstname, email, role, password, status, email_verified_at
                    FROM users
                    ORDER BY lastname ASC, firstname ASC
                `,
            )

            return result.rows.map((row: UserRow) => this.mapRowToUser(row))
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const result = await this.pool.query<UserRow>(
                `
                    SELECT id, lastname, firstname, email, role, password, status, email_verified_at
                    FROM users
                    WHERE email = $1
                    LIMIT 1
                `,
                [email.toLowerCase()],
            )

            if (result.rowCount === 0) {
                return null
            }

            return this.mapRowToUser(result.rows[0])
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }

    async findUnverifiedByEmail(email: string): Promise<User | null> {
        try {
            const result = await this.pool.query<UserRow>(
                `
                    SELECT id, lastname, firstname, email, role, password, status, email_verified_at
                    FROM users
                    WHERE email = $1 AND email_verified_at IS NULL
                    LIMIT 1
                `,
                [email.toLowerCase()],
            )

            if (result.rowCount === 0) {
                return null
            }

            return this.mapRowToUser(result.rows[0])
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }
    async getInformationUserConnected(userId: string, token: string): Promise<UserInfoConnected | null> {
        try {
            const result = await this.pool.query<UserRow>(
                `
                    SELECT  lastname, firstname, email, role, status
                    FROM users
                    inner join sessions on sessions.user_id = users.id
                    WHERE sessions.refresh_token_hash = $2 AND users.id = $1
                    LIMIT 1
                `,
                [userId, token],
            )

            if (result.rowCount === 0) {
                return null
            }

            const row = result.rows[0];
            return new UserInfoConnected(
                row.lastname,
                row.firstname,
                row.email,
                Role.from(row.role),
                row.status,
            );
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }
    async setEmailVerified(userId: string, verifiedAt: Date): Promise<void> {
        try {
            await this.pool.query(
                `
                    UPDATE users
                    SET email_verified_at = $1
                    WHERE id = $2
                `,
                [verifiedAt, userId],
            )
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }

    private mapRowToUser(row: UserRow): User {
        return new User(
            row.id,
            row.lastname,
            row.firstname,
            row.email,
            Role.from(row.role),
            row.password,
            row.status,
            row.email_verified_at,
        )
    }

    private handleDatabaseError(unknownError: unknown): never {
        const error = ensureError(unknownError, "Unexpected database error")
        console.error("Database operation failed", error)
        throw new InfrastructureError("Database unavailable. Please try again later.")
    }
}