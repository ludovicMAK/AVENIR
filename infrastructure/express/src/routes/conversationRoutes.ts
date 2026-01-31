import { Router } from "express";
import { ConversationHttpHandler } from "@express/src/http/ConversationHttpHandler";

export function createConversationRoutes(
  conversationHttpHandler: ConversationHttpHandler
): Router {
  const router = Router();

  router.post("/conversations", (request, response) =>
    conversationHttpHandler.create(request, response)
  );

  router.post("/conversations/group", (request, response) =>
    conversationHttpHandler.createGroup(request, response)
  );

  router.post("/conversations/messages", (request, response) =>
    conversationHttpHandler.sendMessage(request, response)
  );

  router.post("/conversations/transfer", (request, response) =>
    conversationHttpHandler.transfer(request, response)
  );

  router.patch("/conversations/:conversationId/close", (request, response) =>
    conversationHttpHandler.close(request, response)
  );

  router.get("/conversations/:conversationId/messages", (request, response) =>
    conversationHttpHandler.getMessages(request, response)
  );

  router.get("/customers/me/conversations", (request, response) =>
    conversationHttpHandler.getMyConversations(request, response)
  );

  router.get("/customers/:customerId/conversations", (request, response) =>
    conversationHttpHandler.getCustomerConversations(request, response)
  );

  router.get("/advisors/:advisorId/conversations", (request, response) =>
    conversationHttpHandler.getAdvisorConversations(request, response)
  );

  router.get("/conversations/:conversationId/participants", (request, response) =>
    conversationHttpHandler.getParticipants(request, response)
  );

  router.post(
    "/conversations/:conversationId/participants",
    (request, response) =>
      conversationHttpHandler.addParticipant(request, response)
  );

  return router;
}
