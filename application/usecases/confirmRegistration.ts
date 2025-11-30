import { UserRepository } from "@application/repositories/users"
import { EmailConfirmationTokenRepository } from "@application/repositories/emailConfirmationTokens"
import { NotFoundError, ValidationError } from "@application/errors"
import { AccountRepository } from "@application/repositories/account"
import { IBANGenerator } from "@application/services/IBANGenreator"

export class ConfirmRegistration {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailConfirmationTokenRepository: EmailConfirmationTokenRepository,
        private readonly accountRepository: AccountRepository,
        private readonly ibanGenerator: IBANGenerator,
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
        const IBAN = this.ibanGenerator.generate();
        await this.accountRepository.createAccountForUser(confirmationToken.userId, IBAN);
    }
}