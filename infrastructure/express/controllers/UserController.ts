import { RegisterUser } from "@application/usecases/users/registerUser";
import { GetAllUsers } from "@application/usecases/users/getAllUsers";
import { GetAllUsersWithStats } from "@application/usecases/users/getAllUsersWithStats";
import { LoginUser } from "@application/usecases/users/loginUser";
import { ConfirmRegistration } from "@application/usecases/users/confirmRegistration";
import { GetUserById } from "@application/usecases/users/getUserById";
import { GetUserByToken } from "@application/usecases/users/getUserByToken";
import { BanUser } from "@application/usecases/users/banUser";
import { UnbanUser } from "@application/usecases/users/unbanUser";
import { DeleteUser } from "@application/usecases/users/deleteUser";
import { RegisterUserInput, LoginUserInput } from "@application/requests/auth";
import { User } from "@domain/entities/users";
import { UserStats } from "@application/types/users";

export class UserController {
  public constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
    private readonly getAllUsers: GetAllUsers,
    private readonly getAllUsersWithStats: GetAllUsersWithStats,
    private readonly confirmRegistration: ConfirmRegistration,
    private readonly getUserById: GetUserById,
    private readonly getUserByToken: GetUserByToken,
    private readonly banUser: BanUser,
    private readonly unbanUser: UnbanUser,
    private readonly deleteUserUseCase: DeleteUser
  ) {}

  public async register(
    payload: RegisterUserInput
  ): Promise<{ userId: string }> {
    return await this.registerUser.execute(payload);
  }

  public async confirmRegistrationToken(token: string): Promise<void> {
    await this.confirmRegistration.execute(token);
  }

  public async login(
    payload: LoginUserInput
  ): Promise<{ user: {
    id: string;
    lastname: string;
    firstname: string;
    email: string;
    role: string;
    status: string;
    emailVerifiedAt: string | null;
  }; token: string }> {
    return this.loginUser.execute(payload);
  }

  public async list(): Promise<User[]> {
    return this.getAllUsers.execute();
  }

  public async listWithStats(): Promise<UserStats[]> {
    return this.getAllUsersWithStats.execute();
  }

  public async ban(userId: string): Promise<void> {
    await this.banUser.execute(userId);
  }

  public async unban(userId: string): Promise<void> {
    await this.unbanUser.execute(userId);
  }

  public async delete(userId: string): Promise<void> {
    await this.deleteUserUseCase.execute(userId);
  }

  public async findById(id: string): Promise<User> {
    return this.getUserById.execute(id);
  }

  public async findByToken(token: string): Promise<User> {
    return this.getUserByToken.execute(token);
  }
}
