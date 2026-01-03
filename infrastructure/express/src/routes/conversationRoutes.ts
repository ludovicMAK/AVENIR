import { Router } from "express";
import { ConversationHttpHandler } from "@express/src/http/ConversationHttpHandler";

export function createConversationRoutes(
  conversationHttpHandler: ConversationHttpHandler
): Router {
  const router = Router();

  // Create a new conversation
  router.post("/conversations", (request, response) =>
    conversationHttpHandler.create(request, response)
  );

  // Create a new group conversation
  router.post("/conversations/group", (request, response) =>
    conversationHttpHandler.createGroup(request, response)
  );

  // Send a message to a conversation
  router.post("/conversations/messages", (request, response) =>
    conversationHttpHandler.sendMessage(request, response)
  );

  // Transfer a conversation to another advisor
  router.post("/conversations/transfer", (request, response) =>
    conversationHttpHandler.transfer(request, response)
  );

  // Close a conversation
  router.patch("/conversations/:conversationId/close", (request, response) =>
    conversationHttpHandler.close(request, response)
  );

  // Get messages of a conversation
  router.get("/conversations/:conversationId/messages", (request, response) =>
    conversationHttpHandler.getMessages(request, response)
  );

  // Get conversations for a customer
  router.get("/customers/:customerId/conversations", (request, response) =>
    conversationHttpHandler.getCustomerConversations(request, response)
  );

  // Get conversations for an advisor
  router.get("/advisors/:advisorId/conversations", (request, response) =>
    conversationHttpHandler.getAdvisorConversations(request, response)
  );

  // Add a participant to a conversation
  router.post(
    "/conversations/:conversationId/participants",
    (request, response) =>
      conversationHttpHandler.addParticipant(request, response)
  );

  return router;
}
