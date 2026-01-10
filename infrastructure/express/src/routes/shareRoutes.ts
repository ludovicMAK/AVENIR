import { Router, RequestHandler } from "express";
import { ShareHttpHandler } from "@express/src/http/ShareHttpHandler";

export function createShareRoutes(
  shareHttpHandler: ShareHttpHandler,
  directorMiddleware?: RequestHandler
): Router {
  const router = Router();
  const managerGuard = directorMiddleware ? [directorMiddleware] : [];

  router.post("/shares", ...managerGuard, (request, response) =>
    shareHttpHandler.create(request, response)
  );
  router.get("/shares", (request, response) =>
    shareHttpHandler.getAll(request, response)
  );
  router.get("/shares/:shareId", (request, response) =>
    shareHttpHandler.getById(request, response)
  );
  router.patch("/shares/:shareId", ...managerGuard, (request, response) =>
    shareHttpHandler.update(request, response)
  );
  router.delete("/shares/:shareId", ...managerGuard, (request, response) =>
    shareHttpHandler.delete(request, response)
  );
  router.post("/shares/:shareId/activate", ...managerGuard, (request, response) =>
    shareHttpHandler.activate(request, response)
  );
  router.post("/shares/:shareId/deactivate", ...managerGuard, (request, response) =>
    shareHttpHandler.deactivate(request, response)
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
  router.get("/positions", (request, response) =>
    shareHttpHandler.getPositions(request, response)
  );
  router.get("/customers/:customerId/orders", (request, response) =>
    shareHttpHandler.getOrders(request, response)
  );
  router.get("/my-orders", (request, response) =>
    shareHttpHandler.getOrders(request, response)
  );
  router.post("/shares/:shareId/execute-matching", (request, response) =>
    shareHttpHandler.executeMatchingOrders(request, response)
  );
  router.get("/shares/:shareId/price", (request, response) =>
    shareHttpHandler.calculatePrice(request, response)
  );
  router.get("/shares/:shareId/order-book", (request, response) =>
    shareHttpHandler.getOrderBook(request, response)
  );
  router.get("/shares/:shareId/transactions", (request, response) =>
    shareHttpHandler.getTransactionHistory(request, response)
  );

  return router;
}
