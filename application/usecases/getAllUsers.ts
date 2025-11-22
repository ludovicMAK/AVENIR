import { UserRepository } from "@application/repositories/users"
import { User } from "@domain/entities/users"

export class GetAllUsers {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(): Promise<User[]> {
        return this.userRepository.findAll()
    }
}