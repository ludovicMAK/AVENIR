import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { WebSocketService } from "@application/services/WebSocketService";
import { Message } from "@domain/entities/message";
import { Conversation } from "@domain/entities/conversation";

type SocketPayload =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | SocketPayload[]
  | { [key: string]: SocketPayload };

export class SocketIOService implements WebSocketService {
  private io: Server;
  private userSockets: Map<string, string[]> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
  }

  initialize(): void {
    this.io.on("connection", (socket: Socket) => {
      const userId = socket.data.userId as string | undefined;

      if (userId) {
        this.associateUserWithSocket(userId, socket.id);
      } else {
        console.warn(
          `Socket ${socket.id} connected without userId (auth middleware missing?)`
        );
      }

      socket.on("disconnect", () => {
        if (userId) {
          this.removeSocketFromUser(userId, socket.id);
        }
      });
    });
  }

  async emitNewMessage(
    conversationId: string,
    message: Message
  ): Promise<void> {
    this.io.to(`conversation:${conversationId}`).emit("message:new", {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      text: message.text,
      sendDate: message.sendDate,
    });
  }

  async emitConversationCreated(conversation: Conversation): Promise<void> {
    if (conversation.customerId) {
      this.emitToUser(conversation.customerId, "conversation:created", {
        id: conversation.id,
        subject: conversation.subject,
        status: conversation.status.toString(),
        type: conversation.type.toString(),
        dateOuverture: conversation.dateOuverture,
        customerId: conversation.customerId,
      });
    }
  }

  async emitConversationClosed(conversationId: string): Promise<void> {
    this.io
      .to(`conversation:${conversationId}`)
      .emit("conversation:closed", { conversationId });
  }

  async emitConversationTransferred(
    conversationId: string,
    fromAdvisorId: string,
    toAdvisorId: string
  ): Promise<void> {
    this.io
      .to(`conversation:${conversationId}`)
      .emit("conversation:transferred", {
        conversationId,
        fromAdvisorId,
        toAdvisorId,
      });
  }

  async joinConversationRoom(
    userId: string,
    conversationId: string
  ): Promise<void> {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.join(`conversation:${conversationId}`);
        }
      });
    }
  }

  async leaveConversationRoom(
    userId: string,
    conversationId: string
  ): Promise<void> {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(`conversation:${conversationId}`);
        }
      });
    }
  }

  private associateUserWithSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId) || [];
    if (!sockets.includes(socketId)) {
      sockets.push(socketId);
    }
    this.userSockets.set(userId, sockets);
  }

  private removeSocketFromUser(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      const filtered = sockets.filter((id) => id !== socketId);
      if (filtered.length > 0) {
        this.userSockets.set(userId, filtered);
      } else {
        this.userSockets.delete(userId);
      }
    }
  }

  private emitToUser(
    userId: string,
    event: string,
    data: SocketPayload
  ): void {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  getIO(): Server {
    return this.io;
  }
}
