import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/users";
import { User } from "../../domain/entities/users";
import { Role } from "../../domain/object-value/role";

export class RegisterUser {
  constructor(private userRepo: UserRepository) {}

  async execute(user: User) {
    this.userRepo.save(user);
  }
}
