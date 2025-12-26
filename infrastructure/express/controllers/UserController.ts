import { RegisterUser } from "@application/usecases/users/registerUser";
import { GetAllUsers } from "@application/usecases/users/getAllUsers";
import { LoginUser } from "@application/usecases/users/loginUser";
import { ConfirmRegistration } from "@application/usecases/users/confirmRegistration";
import { RegisterUserInput, LoginUserInput } from "@application/requests/auth";
import { User } from "@domain/entities/users";

export class UserController {
  public constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
    private readonly getAllUsers: GetAllUsers,
    private readonly confirmRegistration: ConfirmRegistration
  ) {}

  public async register(payload: RegisterUserInput): Promise<void> {
    await this.registerUser.execute(payload);
  }

  public async confirmRegistrationToken(token: string): Promise<void> {
    await this.confirmRegistration.execute(token);
  }

  public async login(payload: LoginUserInput): Promise<User> {
    return this.loginUser.execute(payload);
  }

  public async list(): Promise<User[]> {
    return this.getAllUsers.execute();
  }
}
