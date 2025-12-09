import { UserRepository } from "@application/repositories/users"
import { EmailConfirmationTokenRepository } from "@application/repositories/emailConfirmationTokens"
import { ValidationError, ConflictError } from "@application/errors"
import { User } from "@domain/entities/users"
import { EmailConfirmationToken } from "@domain/entities/emailConfirmationToken"
import { Role } from "@domain/values/role"
import { RegisterUserInput } from "@application/requests/auth"
import { AccountRepository } from "@application/repositories/account"
import { IBANGenerator } from "@application/services/IBANGenreator"
import { Account } from "@domain/entities/account"
import { AccountType } from "@domain/values/accountType"
import { StatusAccount } from "@domain/values/statusAccount"
import { PasswordHasher } from "@application/services/PasswordHasher"
import { UuidGenerator } from "@application/services/UuidGenerator"
import { TokenGenerator } from "@application/services/TokenGenerator"
import { EmailSender } from "@application/services/EmailSender"

export class RegisterUser {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailConfirmationTokenRepository: EmailConfirmationTokenRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly uuidGenerator: UuidGenerator,
        private readonly tokenGenerator: TokenGenerator,
        private readonly emailSender: EmailSender,
    ) {}

    async execute(input: RegisterUserInput): Promise<void> {
        const normalizedEmail = input.email.trim().toLowerCase()

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            throw new ValidationError("Invalid email format")
        }

        if (!input.password || input.password.length < 8) {
            throw new ValidationError("Password too short")
        }

        const existingUser = await this.userRepository.findByEmail(normalizedEmail)
        if (existingUser) {
            if (!existingUser.isEmailVerified()) {
                throw new ConflictError(
                    "An account with this email already exists but is not verified. Please check your email for the confirmation link."
                )
            }
            throw new ConflictError("Email already registered")
        }

        const passwordHash = await this.passwordHasher.hash(input.password)
        const userId = this.uuidGenerator.generate()

        const user = new User(
            userId,
            input.lastname.trim(),
            input.firstname.trim(),
            normalizedEmail,
            Role.CUSTOMER,
            passwordHash,
            "active",
            null,
        )

        await this.userRepository.save(user)
        

        const confirmationToken = this.tokenGenerator.generate()
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        const token = new EmailConfirmationToken(userId, confirmationToken, expiresAt)
        await this.emailConfirmationTokenRepository.save(token)

        await this.emailSender.sendConfirmationEmail(
            normalizedEmail, 
            confirmationToken, 
            input.firstname.trim(), 
            input.lastname.trim()
        )
    }
}