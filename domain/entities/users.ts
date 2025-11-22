import { Role } from "@domain/values/role"

export class User {
    constructor(
        readonly id: string,
        readonly lastname: string,
        readonly firstname: string,
        readonly email: string,
        readonly role: Role,
        readonly password: string
    ) {}
}