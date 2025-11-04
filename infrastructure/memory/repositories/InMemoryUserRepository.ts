import { UserRepository } from "../../../application/repositories/users";
import { User } from "../../../domain/entities/users";

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  public async save(user: User): Promise<void> {
    this.users.push(user);
  }
  public getAllUsers(): User[] {
    return this.users;
  }
}