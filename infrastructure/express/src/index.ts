import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { UserController } from "./controller/UserController";
import { InMemoryUserRepository } from "../../memory/repositories/InMemoryUserRepository";
import cors from "cors";

const server = express();

server.use(cors({
  origin: "http://localhost:3000", 
  credentials: true
}));

server.use(bodyParser.json());

const userRepository = new InMemoryUserRepository();
const userController = new UserController(userRepository);

server.post("/api/register", async (request: Request, response: Response) => {
  await userController.register(request, response);
});

server.get("/api/users", async (request: Request, response: Response) => {
  await userController.getAllUsers(request, response);
});

server.listen(8000, "0.0.0.0", () => {
  console.log("🚀 Server started on http://localhost:8000");
});
