import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { WebSocketService } from "@application/services/WebSocketService";
import { Message } from "@domain/entities/message";
import { Conversation } from "@domain/entities/conversation";

export class SocketIOService implements WebSocketService {
  private io: Server;
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*", // TODO: Configure this properly for production
        methods: ["GET", "POST"],
      },
    });
  }

  initialize(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Store socket connection - will be associated with user after auth
      socket.on("authenticate", (data: { userId: string }) => {
        this.associateUserWithSocket(data.userId, socket.id);
        socket.data.userId = data.userId;
        console.log(`User ${data.userId} authenticated on socket ${socket.id}`);
      });

      socket.on("join:conversation", (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        console.log(
          `Socket ${socket.id} joined conversation:${conversationId}`
        );
      });

      socket.on("leave:conversation", (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`Socket ${socket.id} left conversation:${conversationId}`);
      });

      socket.on("disconnect", () => {
        const userId = socket.data.userId;
        if (userId) {
          this.removeSocketFromUser(userId, socket.id);
        }
        console.log(`Client disconnected: ${socket.id}`);
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
    // Emit to customer if private conversation
    if (conversation.customerId) {
      this.emitToUser(conversation.customerId, "conversation:created", {
        id: conversation.id,
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

  private emitToUser(userId: string, event: string, data: any): void {
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
