import { Router } from "express"
import { UserHttpHandler } from "@express/src/http/UserHttpHandler"
import { AccountHttpHandler } from "./http/AccountHttpHandler"


export function createHttpRouter(userHttpHandler: UserHttpHandler, accountHttpHandler: AccountHttpHandler): Router {
    const router = Router()

    router.post("/users/register", (request, response) => userHttpHandler.register(request, response))
    router.get("/users/confirm-registration", (request, response) => userHttpHandler.confirmRegistration(request, response))
    router.post("/login", (request, response) => userHttpHandler.login(request, response))
    router.get("/users", (request, response) => userHttpHandler.list(request, response))
    router.post("/dashboard",(request, response) => accountHttpHandler.listByOwnerId(request, response))

    return router
}