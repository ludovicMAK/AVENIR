import { Server } from "socket.io";
import { ConversationController } from "@express/controllers/ConversationController";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { ConversationRepository } from "@application/repositories/conversation";

export class ConversationSocketHandler {
  constructor(
    private readonly io: Server,
    private readonly controller: ConversationController,
    private readonly participantRepository: ParticipantConversationRepository,
    private readonly conversationRepository: ConversationRepository
  ) {}

  registerHandlers(): void {
    this.io.on("connection", (socket) => {
      const userId = socket.data.userId;
      const token = socket.data.token;

      console.log(`User ${userId} connected via WebSocket`);

      // Send message event
      socket.on(
        "message:send",
        async (data: { conversationId: string; text: string }) => {
          try {
            const message = await this.controller.sendMessageToConversation(
              data.conversationId,
              userId,
              data.text,
              token
            );

            // Message will be broadcast to room by the use case via WebSocketService
            socket.emit("message:sent", {
              success: true,
              messageId: message.id,
            });
          } catch (error: any) {
            socket.emit("message:error", {
              error: error.message || "Failed to send message",
            });
          }
        }
      );

      // Join conversation room
      socket.on("conversation:join", async (conversationId: string) => {
        try {
          // Verify user has access to this conversation
          const conversation = await this.conversationRepository.findById(
            conversationId
          );

          if (!conversation) {
            socket.emit("conversation:error", {
              error: "Conversation not found",
            });
            return;
          }

          // Check if user is participant (for private) or customer (for private)
          let hasAccess = false;

          if (conversation.type.isPrivate()) {
            if (conversation.customerId === userId) {
              hasAccess = true;
            } else {
              const participant =
                await this.participantRepository.findByConversationIdAndAdvisorId(
                  conversationId,
                  userId
                );
              hasAccess = participant !== null;
            }
          } else {
            // Group conversation - check participant
            const participant =
              await this.participantRepository.findByConversationIdAndAdvisorId(
                conversationId,
                userId
              );
            hasAccess = participant !== null;
          }

          if (!hasAccess) {
            socket.emit("conversation:error", {
              error: "Access denied to this conversation",
            });
            return;
          }

          socket.join(`conversation:${conversationId}`);
          socket.emit("conversation:joined", { conversationId });
          console.log(
            `User ${userId} joined conversation room: ${conversationId}`
          );
        } catch (error: any) {
          socket.emit("conversation:error", {
            error: error.message || "Failed to join conversation",
          });
        }
      });

      // Leave conversation room
      socket.on("conversation:leave", (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        socket.emit("conversation:left", { conversationId });
        console.log(`User ${userId} left conversation room: ${conversationId}`);
      });

      // User typing indicator
      socket.on("typing:start", (data: { conversationId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit("user:typing", {
          conversationId: data.conversationId,
          userId,
        });
      });

      socket.on("typing:stop", (data: { conversationId: string }) => {
        socket
          .to(`conversation:${data.conversationId}`)
          .emit("user:stopped-typing", {
            conversationId: data.conversationId,
            userId,
          });
      });

      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected from WebSocket`);
      });
    });
  }
}
