import { UserRepository } from "@application/repositories/users"
import { ValidationError, ConflictError } from "@application/errors"
import { Role } from "@domain/values/role"
import { User } from "@domain/entities/users"
import { RegisterUserInput } from "@application/requests/auth"
import { PasswordHasher } from "../services/PasswordHasher"
import { UuidGenerator } from "../services/UuidGenerator"

export class RegisterUser {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly uuidGenerator: UuidGenerator,
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
            throw new ConflictError("Email already registered")
        }

        const passwordHash = await this.passwordHasher.hash(input.password)

        const user = new User(
            this.uuidGenerator.generate(),
            input.lastname.trim(),
            input.firstname.trim(),
            normalizedEmail,
            Role.CUSTOMER,
            passwordHash,
        )

        await this.userRepository.save(user)
    }
}

