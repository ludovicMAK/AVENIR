import { Server } from "socket.io";
import { ConversationController } from "@express/controllers/ConversationController";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { ConversationRepository } from "@application/repositories/conversation";
import { UserRepository } from "@application/repositories/users";
import { ErrorLike } from "@application/utils/errors";
import { Role } from "@domain/values/role";

export class ConversationSocketHandler {
  constructor(
    private readonly io: Server,
    private readonly controller: ConversationController,
    private readonly participantRepository: ParticipantConversationRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly userRepository: UserRepository
  ) {}

  registerHandlers(): void {
    this.io.on("connection", (socket) => {
      const userId = socket.data.userId;
      const token = socket.data.token;

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

            socket.emit("message:sent", {
              success: true,
              messageId: message.id,
            });
          } catch (error) {
            socket.emit("message:error", {
              error: this.extractErrorMessage(
                error,
                "Failed to send message"
              ),
            });
          }
        }
      );

      socket.on("conversation:join", async (conversationId: string) => {
        try {
          const conversation = await this.conversationRepository.findById(
            conversationId
          );

          if (!conversation) {
            socket.emit("conversation:error", {
              error: "Conversation not found",
            });
            return;
          }

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
              if (participant !== null) {
                hasAccess = true;
              } else {
                const activeParticipants =
                  await this.participantRepository.findActiveByConversationId(
                    conversationId
                  );

                if (activeParticipants.length === 0) {
                  const user = await this.userRepository.findById(userId);
                  if (user && user.role.equals(Role.ADVISOR)) {
                    hasAccess = true;
                  }
                }
              }
            }
          } else {
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
        } catch (error) {
          socket.emit("conversation:error", {
            error: this.extractErrorMessage(
              error,
              "Failed to join conversation"
            ),
          });
        }
      });

      socket.on("conversation:leave", (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        socket.emit("conversation:left", { conversationId });
      });

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
    });
  }

  private extractErrorMessage(error: ErrorLike, fallback: string): string {
    if (typeof error === "string") {
      return error;
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (error && typeof error === "object" && "message" in error) {
      const message = (error as { message?: string }).message;
      if (typeof message === "string") {
        return message;
      }
    }
    return fallback;
  }
}
