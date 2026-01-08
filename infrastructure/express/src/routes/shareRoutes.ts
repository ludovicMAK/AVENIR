import { Router, RequestHandler } from "express";
import { ShareHttpHandler } from "@express/src/http/ShareHttpHandler";

export function createShareRoutes(
  shareHttpHandler: ShareHttpHandler,
  directorMiddleware?: RequestHandler
): Router {
  const router = Router();

  // Routes publiques (accessible à tous les utilisateurs authentifiés)
  router.get("/shares", (request, response) =>
    shareHttpHandler.getAll(request, response)
  );
  router.get("/shares/:id", (request, response) =>
    shareHttpHandler.getById(request, response)
  );

  // Routes réservées au directeur
  if (directorMiddleware) {
    router.post("/shares", directorMiddleware, (request, response) =>
      shareHttpHandler.create(request, response)
    );
    router.put("/shares/:id", directorMiddleware, (request, response) =>
      shareHttpHandler.update(request, response)
    );
    router.delete("/shares/:id", directorMiddleware, (request, response) =>
      shareHttpHandler.delete(request, response)
    );
  } else {
    // Fallback si pas de middleware (pour compatibilité)
    router.post("/shares", (request, response) =>
      shareHttpHandler.create(request, response)
    );
    router.put("/shares/:id", (request, response) =>
      shareHttpHandler.update(request, response)
    );
    router.delete("/shares/:id", (request, response) =>
      shareHttpHandler.delete(request, response)
    );
  }

  // Routes pour les ordres (clients)
  router.post("/orders", (request, response) =>
    shareHttpHandler.placeOrder(request, response)
  );
  router.delete("/orders/:orderId", (request, response) =>
    shareHttpHandler.cancelOrder(request, response)
  );
  router.get("/my-orders", (request, response) =>
    shareHttpHandler.getMyOrders(request, response)
  );
  router.get("/positions", (request, response) =>
    shareHttpHandler.getMyPositions(request, response)
  );
  router.get("/customers/:customerId/positions", (request, response) =>
    shareHttpHandler.getPositions(request, response)
  );
  router.get("/customers/:customerId/orders", (request, response) =>
    shareHttpHandler.getOrders(request, response)
  );
  router.post("/shares/:id/execute-matching", (request, response) =>
    shareHttpHandler.executeMatchingOrders(request, response)
  );
  router.get("/shares/:id/price", (request, response) =>
    shareHttpHandler.calculatePrice(request, response)
  );
  router.get("/shares/:id/order-book", (request, response) =>
    shareHttpHandler.getOrderBook(request, response)
  );
  router.get("/shares/:id/transactions", (request, response) =>
    shareHttpHandler.getTransactionHistory(request, response)
  );

  router.get("/shares/:shareId/transactions", (request, response) =>
    shareHttpHandler.getTransactionHistory(request, response)
  );
  router.get("/shares/:shareId/order-book", (request, response) =>
    shareHttpHandler.getOrderBook(request, response)
  );
  router.get("/shares/:shareId/price", (request, response) =>
    shareHttpHandler.calculatePrice(request, response)
  );
  router.post("/shares/:shareId/execute", (request, response) =>
    shareHttpHandler.executeMatchingOrders(request, response)
  );

  return router;
}
