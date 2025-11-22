import { Router } from "express"
import { RegisterUser } from "@application/usecases/registerUser"
import { LoginUser } from "@application/usecases/loginUser"
import { GetAllUsers } from "@application/usecases/getAllUsers"
import { userRepository } from "@express/src/config/repositories"
import { UserController } from "@express/controllers/UserController"
import { UserHttpHandler } from "@express/src/http/UserHttpHandler"
import { CryptoPasswordHasher } from "@adapters/services/CryptoPasswordHasher"
import { NodeUuidGenerator } from "@adapters/services/NodeUuidGenerator"

const passwordHasher = new CryptoPasswordHasher()
const uuidGenerator = new NodeUuidGenerator()

const registerUser = new RegisterUser(userRepository, passwordHasher, uuidGenerator)
const loginUser = new LoginUser(userRepository, passwordHasher)
const getAllUsers = new GetAllUsers(userRepository)

const userController = new UserController(registerUser, loginUser, getAllUsers)
const userHttpHandler = new UserHttpHandler(userController)

export const httpRouter = Router()

httpRouter.post("/users/register", (request, response) => userHttpHandler.register(request, response))
httpRouter.post("/login", (request, response) => userHttpHandler.login(request, response))
httpRouter.get("/users", (request, response) => userHttpHandler.list(request, response))