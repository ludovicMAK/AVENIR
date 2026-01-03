import { Server as HttpServer } from "http";
import { SocketIOService } from "@adapters/services/SocketIOService";
import { ConversationSocketHandler } from "@express/src/socket/ConversationSocketHandler";
import { createSocketAuthMiddleware } from "@express/src/middleware/socketAuth";
import {
  sessionRepository,
  conversationRepository,
  participantConversationRepository,
} from "./repositories";

let socketService: SocketIOService | null = null;

export function initializeWebSocket(
  httpServer: HttpServer,
  conversationController: any,
  useCases: {
    createConversation: any;
    createGroupConversation: any;
    sendMessage: any;
    transferConversation: any;
    closeConversation: any;
    addParticipant: any;
  }
): SocketIOService {
  // Create Socket.IO service
  socketService = new SocketIOService(httpServer);

  // Apply authentication middleware
  const authMiddleware = createSocketAuthMiddleware(sessionRepository);
  socketService.getIO().use(authMiddleware);

  // Initialize base connection handling
  socketService.initialize();

  // Inject WebSocket service into use cases
  (useCases.createConversation as any).webSocketService = socketService;
  (useCases.createGroupConversation as any).webSocketService = socketService;
  (useCases.sendMessage as any).webSocketService = socketService;
  (useCases.transferConversation as any).webSocketService = socketService;
  (useCases.closeConversation as any).webSocketService = socketService;
  (useCases.addParticipant as any).webSocketService = socketService;

  // Register conversation-specific handlers
  const conversationHandler = new ConversationSocketHandler(
    socketService.getIO(),
    conversationController,
    participantConversationRepository,
    conversationRepository
  );
  conversationHandler.registerHandlers();

  console.log("WebSocket server configured and ready");

  return socketService;
}

export function getSocketService(): SocketIOService | null {
  return socketService;
}
