import { Server as HttpServer } from "http";
import { SocketIOService } from "@adapters/services/SocketIOService";
import { ConversationSocketHandler } from "@express/src/socket/ConversationSocketHandler";
import { createSocketAuthMiddleware } from "@express/src/middleware/socketAuth";
import {
  sessionRepository,
  conversationRepository,
  participantConversationRepository,
  userRepository,
} from "./repositories";
import { ConversationController } from "@express/controllers/ConversationController";

type WebSocketAware = {
  setWebSocketService: (service: SocketIOService) => void;
};

let socketService: SocketIOService | null = null;

export function initializeWebSocket(
  httpServer: HttpServer,
  conversationController: ConversationController,
  useCases: {
    createConversation: WebSocketAware;
    createGroupConversation: WebSocketAware;
    sendMessage: WebSocketAware;
    transferConversation: WebSocketAware;
    closeConversation: WebSocketAware;
    addParticipant: WebSocketAware;
  }
): SocketIOService {
  socketService = new SocketIOService(httpServer);

  const authMiddleware = createSocketAuthMiddleware(sessionRepository);
  socketService.getIO().use(authMiddleware);

  socketService.initialize();

  useCases.createConversation.setWebSocketService(socketService);
  useCases.createGroupConversation.setWebSocketService(socketService);
  useCases.sendMessage.setWebSocketService(socketService);
  useCases.transferConversation.setWebSocketService(socketService);
  useCases.closeConversation.setWebSocketService(socketService);
  useCases.addParticipant.setWebSocketService(socketService);

  const conversationHandler = new ConversationSocketHandler(
    socketService.getIO(),
    conversationController,
    participantConversationRepository,
    conversationRepository,
    userRepository
  );
  conversationHandler.registerHandlers();

  return socketService;
}

export function getSocketService(): SocketIOService | null {
  return socketService;
}
