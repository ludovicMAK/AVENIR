import { UserRepository } from "../../../../application/repositories/users";
import { RegisterUser } from "../../../../application/usecase/registerUser";
import { GetAllUsers } from "../../../../application/usecase/getAllUsers";
import { Request, Response } from "express";
import { User } from "../../../../domain/entities/users";
import { Role } from "../../../../domain/object-value/role";

export class UserController {
  public constructor(
    private readonly userRepository: UserRepository,
  ) {}

  public async register(request: Request, response: Response) {
    if (!request.body.lastname || !request.body.firstname || !request.body.email || !request.body.password) {
      response.status(400).json({
        message: "Missing parameters."
      });
      return;
    }

    const user = new User(
      crypto.randomUUID(),
      request.body.lastname,
      request.body.firstname,
      request.body.email,
      Role.CUSTOMER,
       request.body.password,
    );

    const registerUser = new RegisterUser(this.userRepository);
    await registerUser.execute(user);

    response.status(201).json({
      
      message: "Register successfully."
    });
  }
  public async getAllUsers(request: Request, response: Response) {
    const getAllUsers = new GetAllUsers(this.userRepository);
    const users = await getAllUsers.execute();
    response.status(200).json(users);
  }
  
}