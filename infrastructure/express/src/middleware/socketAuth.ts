import { Socket } from "socket.io";
import { SessionRepository } from "@application/repositories/session";
import { ExtendedError } from "socket.io/dist/namespace";

export function createSocketAuthMiddleware(
  sessionRepository: SessionRepository
) {
  return async (socket: Socket, next: (err?: ExtendedError) => void) => {
    try {
      const token = socket.handshake.auth.token as string;
      const userId = socket.handshake.auth.userId as string;

      if (!token || !userId) {
        return next(new Error("Authentication required"));
      }

      const isConnected = await sessionRepository.isConnected(userId, token);

      if (!isConnected) {
        return next(new Error("Invalid or expired session"));
      }

      socket.data.userId = userId;
      socket.data.token = token;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  };
}
