import { UserRepository } from "@application/repositories/users"
import { EmailConfirmationTokenRepository } from "@application/repositories/emailConfirmationTokens"
import { NotFoundError, ValidationError } from "@application/errors"

export class ConfirmRegistration {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailConfirmationTokenRepository: EmailConfirmationTokenRepository,
    ) {}

    async execute(token: string): Promise<void> {
        const confirmationToken = await this.emailConfirmationTokenRepository.findByToken(token)
        
        if (!confirmationToken) {
            throw new NotFoundError("Invalid or expired confirmation token")
        }

        if (confirmationToken.isExpired()) {
            await this.emailConfirmationTokenRepository.deleteByToken(token)
            throw new ValidationError("Confirmation token has expired")
        }

        await this.userRepository.setEmailVerified(confirmationToken.userId, new Date())
        await this.emailConfirmationTokenRepository.deleteByToken(token)
    }
}