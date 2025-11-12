import { Router } from "express";
import { UserController } from "./controllers/UserController";
import { InMemoryUserRepository } from "@/infrastructure/express/repositories/memory/InMemoryUserRepository";

const userRepository = new InMemoryUserRepository();
const userController = new UserController(userRepository);

export const httpRouter = Router();

httpRouter.post("/users/register", (req, res) => userController.register(req, res));
httpRouter.post("/login", (req, res) => userController.login(req, res));
httpRouter.get("/users", (req, res) => userController.getAllUsers(req, res));