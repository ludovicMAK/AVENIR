import { UserRepository } from "@/application/repositories/users";
import { UnauthorizedError } from "@/application/errors";
import { createHash } from "node:crypto";
import { User } from "@/domain/entities/users";
import { LoginUserInput } from "@/application/types/auth";

export class LoginUser {
    private readonly userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async execute(input: LoginUserInput): Promise<User> {
        const email = input.email.toLowerCase();
        const passwordHash = createHash("sha256").update(input.password).digest("hex");

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new UnauthorizedError("Invalid credentials");
        }

        if (user.password !== passwordHash) {
            throw new UnauthorizedError("Invalid credentials");
        }

        return user;
    }
}

