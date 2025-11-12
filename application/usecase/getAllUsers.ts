import { UserRepository } from "@/application/repositories/users";
import { User } from "@/domain/entities/users";

export class GetAllUsers {
    private readonly userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async execute(): Promise<User[]> {
        return this.userRepository.findAll();
    }
}