import { RegisterUser } from "@application/usecases/users/registerUser";
import { GetAllUsers } from "@application/usecases/users/getAllUsers";
import { LoginUser } from "@application/usecases/users/loginUser";
import { ConfirmRegistration } from "@application/usecases/users/confirmRegistration";
import { GetUserById } from "@application/usecases/users/getUserById";
import { GetUserByToken } from "@application/usecases/users/getUserByToken";
import { RegisterUserInput, LoginUserInput } from "@application/requests/auth";
import { User } from "@domain/entities/users";

export class UserController {
  public constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
    private readonly getAllUsers: GetAllUsers,
    private readonly confirmRegistration: ConfirmRegistration,
    private readonly getUserById: GetUserById,
    private readonly getUserByToken: GetUserByToken
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
  ): Promise<{ user: User; token: string }> {
    return this.loginUser.execute(payload);
  }

  public async list(): Promise<User[]> {
    return this.getAllUsers.execute();
  }

  public async findById(id: string): Promise<User> {
    return this.getUserById.execute(id);
  }

  public async findByToken(token: string): Promise<User> {
    return this.getUserByToken.execute(token);
  }
}
