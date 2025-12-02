import { Router } from "express";
import { UserHttpHandler } from "@express/src/http/UserHttpHandler";
import { AccountHttpHandler } from "./http/AccountHttpHandler";
import { ShareHttpHandler } from "./http/ShareHttpHandler";

export function createHttpRouter(
  userHttpHandler: UserHttpHandler,
  accountHttpHandler: AccountHttpHandler,
  shareHttpHandler: ShareHttpHandler
): Router {
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
  router.post("/dashboard", (request, response) =>
    accountHttpHandler.listByOwnerId(request, response)
  );

  router.post("/shares", (request, response) =>
    shareHttpHandler.create(request, response)
  );
  router.get("/shares", (request, response) =>
    shareHttpHandler.getAll(request, response)
  );
  router.get("/shares/:id", (request, response) =>
    shareHttpHandler.getById(request, response)
  );
  router.post("/orders", (request, response) =>
    shareHttpHandler.placeOrder(request, response)
  );
  router.delete("/orders/:orderId", (request, response) =>
    shareHttpHandler.cancelOrder(request, response)
  );
  router.get("/customers/:customerId/positions", (request, response) =>
    shareHttpHandler.getPositions(request, response)
  );
  router.get("/customers/:customerId/orders", (request, response) =>
    shareHttpHandler.getOrders(request, response)
  );

  return router;
}
