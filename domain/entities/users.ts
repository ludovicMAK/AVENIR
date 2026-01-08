import { Role } from "@domain/values/role";

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
    return this.emailVerifiedAt !== null;
  }

  isActive(): boolean {
    return this.status === "active";
  }

  isBanned(): boolean {
    return this.status === "banned";
  }

  canLogin(): boolean {
    return this.isActive() && this.isEmailVerified();
  }

  withStatus(status: string): User {
    return new User(
      this.id,
      this.lastname,
      this.firstname,
      this.email,
      this.role,
      this.password,
      status,
      this.emailVerifiedAt
    );
  }
}
