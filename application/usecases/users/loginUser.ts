import { UserRepository } from "@application/repositories/users"
import { UnauthorizedError } from "@application/errors"
import { User } from "@domain/entities/users"
import { LoginUserInput } from "@application/requests/auth"
import { PasswordHasher } from "../services/PasswordHasher"

export class LoginUser {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(input: LoginUserInput): Promise<User> {
        const email = input.email.toLowerCase()

        const user = await this.userRepository.findByEmail(email)

        if (!user) {
            throw new UnauthorizedError("Invalid credentials")
        }

        const isPasswordValid = await this.passwordHasher.compare(input.password, user.password)
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid credentials")
        }

        if (!user.canLogin()) {
            throw new UnauthorizedError("Please verify your email address to login")
        }

        return user
    }
}
