import { EmailConfirmationToken } from "@domain/entities/emailConfirmationToken"

export interface EmailConfirmationTokenRepository {
    save(token: EmailConfirmationToken): Promise<void>
    findByToken(token: string): Promise<EmailConfirmationToken | null>
    deleteByToken(token: string): Promise<void>
    deleteExpired(): Promise<void>
}