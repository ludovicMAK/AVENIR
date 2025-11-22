import { UserRepository } from "@application/repositories/users"
import { User } from "@domain/entities/users"

export class InMemoryUserRepository implements UserRepository {
    private readonly items: Map<string, User> = new Map()

    async findByEmail(email: string): Promise<User | null> {
        for (const item of this.items.values()) {
            if (item.email === email) return item
        }
        return null
    }

    async save(user: User): Promise<void> {
        this.items.set(user.id, user)
    }

    async findAll(): Promise<User[]> {
        return Array.from(this.items.values())
    }

    async setEmailVerified(userId: string, verifiedAt: Date): Promise<void> {
        const user = this.items.get(userId)
        if (user) {
            const updatedUser = new User(
                user.id,
                user.lastname,
                user.firstname,
                user.email,
                user.role,
                user.password,
                user.status,
                verifiedAt,
            )
            this.items.set(userId, updatedUser)
        }
    }
}