import { EmailConfirmationTokenRepository } from "@application/repositories/emailConfirmationTokens"
import { EmailConfirmationToken } from "@domain/entities/emailConfirmationToken"

export class InMemoryEmailConfirmationTokenRepository implements EmailConfirmationTokenRepository {
    private readonly items: Map<string, EmailConfirmationToken> = new Map()

    async save(token: EmailConfirmationToken): Promise<void> {
        this.items.set(token.userId, token)
    }

    async findByToken(token: string): Promise<EmailConfirmationToken | null> {
        for (const item of this.items.values()) {
            if (item.token === token) return item
        }
        return null
    }

    async deleteByToken(token: string): Promise<void> {
        for (const [userId, item] of this.items.entries()) {
            if (item.token === token) {
                this.items.delete(userId)
                return
            }
        }
    }

    async deleteExpired(): Promise<void> {
        const now = new Date()
        for (const [userId, item] of this.items.entries()) {
            if (item.expiresAt < now) {
                this.items.delete(userId)
            }
        }
    }
}