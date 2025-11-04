import { UserRepository } from "../repositories/users";
import { User } from "../../domain/entities/users";
import { Role } from "../../domain/object-value/role";

export class GetAllUsers {
  constructor(private userRepo: UserRepository) {}

  public async execute() {
    return this.userRepo.getAllUsers();
  }
}
