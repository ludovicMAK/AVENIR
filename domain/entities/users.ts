import { Role } from "@domain/values/role"

export class User {
    constructor(
        readonly id: string,
        readonly lastname: string,
        readonly firstname: string,
        readonly email: string,
        readonly role: Role,
        readonly password: string,
        readonly status: string,
        readonly emailVerifiedAt: Date | null
    ) {}

    isEmailVerified(): boolean {
        return this.emailVerifiedAt !== null
    }

    isActive(): boolean {
        return this.status === "active"
    }

    canLogin(): boolean {
        return this.isActive() && this.isEmailVerified()
    }
}