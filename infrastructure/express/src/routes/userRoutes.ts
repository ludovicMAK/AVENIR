import { Router } from "express";
import { UserHttpHandler } from "@express/src/http/UserHttpHandler";

export function createUserRoutes(userHttpHandler: UserHttpHandler): Router {
  const router = Router();

  router.post("/users/register", (request, response) =>
    userHttpHandler.register(request, response)
  );
  router.get("/users/confirm-registration", (request, response) =>
    userHttpHandler.confirmRegistration(request, response)
  );
  router.post("/login", (request, response) =>
    userHttpHandler.login(request, response)
  );
  router.get("/users", (request, response) =>
    userHttpHandler.list(request, response)
  );
  router.get("/users/stats", (request, response) =>
    userHttpHandler.listWithStats(request, response)
  );
  router.get("/users/me", (request, response) =>
    userHttpHandler.me(request, response)
  );
  router.patch("/users/:userId/ban", (request, response) =>
    userHttpHandler.ban(request, response)
  );
  router.patch("/users/:userId/unban", (request, response) =>
    userHttpHandler.unban(request, response)
  );
  router.delete("/users/:userId", (request, response) =>
    userHttpHandler.delete(request, response)
  );

  return router;
}
