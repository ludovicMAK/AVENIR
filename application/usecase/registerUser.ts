import { UserRepository } from "@/application/repositories/users";
import { ValidationError, ConflictError } from "@/application/errors";
import { Role } from "@/domain/object-value/role";
import { User } from "@/domain/entities/users";
import { createHash } from "node:crypto";
import { RegisterUserInput } from "@/application/types/auth";

export class RegisterUser {
    private readonly userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async execute(input: RegisterUserInput): Promise<void> {
        const normalizedEmail = input.email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            throw new ValidationError("Invalid email format");
        }

        if (!input.password || input.password.length < 8) {
            throw new ValidationError("Password too short");
        }

        const existingUser = await this.userRepository.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new ConflictError("Email already registered");
        }

        const passwordHash = createHash("sha256").update(input.password).digest("hex");

        const user = new User(
            crypto.randomUUID(),
            input.lastname.trim(),
            input.firstname.trim(),
            normalizedEmail,
            Role.CUSTOMER,
            passwordHash
        );

        await this.userRepository.save(user);
    }
}
