import { UserRepository } from "@application/repositories/users"
import { User } from "@domain/entities/users"
import { NotFoundError } from "@application/errors"

export class GetUserById {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(id: string): Promise<User> {
        const user = await this.userRepository.findById(id)
        if (!user) {
            throw new NotFoundError("User not found")
        }
        return user
    }
}
