import { User } from "../../domain/entities/users";

export interface UserRepository {
    save(user:User):Promise<void>;
    getAllUsers(): User[];
}