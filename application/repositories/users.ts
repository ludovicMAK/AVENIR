import { User } from "@domain/entities/users";
import { UserInfoConnected } from "@domain/values/userInfoConnected";

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(userId: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  findUnverifiedByEmail(email: string): Promise<User | null>;
  setEmailVerified(userId: string, verifiedAt: Date): Promise<void>;
  getInformationUserConnected(
    userId: string,
    token: string
  ): Promise<UserInfoConnected | null>;
  findByRole(role: string): Promise<User[]>;
  updateStatus(userId: string, status: string): Promise<void>;
  delete(userId: string): Promise<void>;
}
