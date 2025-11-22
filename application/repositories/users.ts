import { User } from "@domain/entities/users"

export interface UserRepository {
    save(user: User): Promise<void>
    findAll(): Promise<User[]>
    findByEmail(email: string): Promise<User | null>
    setEmailVerified(userId: string, verifiedAt: Date): Promise<void>
}