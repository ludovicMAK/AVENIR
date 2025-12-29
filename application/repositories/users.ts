import { User } from "@domain/entities/users"
import { UserInfoConnected } from "@domain/values/userInfoConnected"

export interface UserRepository {
    save(user: User): Promise<void>
    findAll(): Promise<User[]>
    findByEmail(email: string): Promise<User | null>
    findUnverifiedByEmail(email: string): Promise<User | null>
    setEmailVerified(userId: string, verifiedAt: Date): Promise<void>
    getInforationUserConnected(userId: string, token: string): Promise<UserInfoConnected | null>
}