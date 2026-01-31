import { io, Socket } from "socket.io-client";
import type {
  ConversationClosedEvent,
  ConversationCreatedEvent,
  ConversationTransferredEvent,
  RealtimeMessage,
  SocketErrorEvent,
} from "@/lib/realtime/types";

export interface ServerToClientEvents {
  "message:new": (payload: RealtimeMessage) => void;
  "conversation:created": (payload: ConversationCreatedEvent) => void;
  "conversation:closed": (payload: ConversationClosedEvent) => void;
  "conversation:transferred": (payload: ConversationTransferredEvent) => void;
  "message:error": (payload: SocketErrorEvent) => void;
  "conversation:error": (payload: SocketErrorEvent) => void;
}

export interface ClientToServerEvents {
  "conversation:join": (conversationId: string) => void;
  "conversation:leave": (conversationId: string) => void;
  "message:send": (payload: { conversationId: string; text: string }) => void;
  "typing:start": (payload: { conversationId: string }) => void;
  "typing:stop": (payload: { conversationId: string }) => void;
}

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function resolveSocketBaseUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicit && explicit.trim().length > 0) {
    return explicit.replace(/\/+$/, "");
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiBaseUrl && apiBaseUrl.trim().length > 0) {
    return apiBaseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return null;
}

export function connectSocket(auth: {
  userId: string;
  token: string;
  transports?: string[];
}): ChatSocket {
  const socketBaseUrl = resolveSocketBaseUrl();
  if (!socketBaseUrl) {
    throw new Error(
      "Missing socket URL (set NEXT_PUBLIC_SOCKET_URL or NEXT_PUBLIC_API_BASE_URL)"
    );
  }

  return io(socketBaseUrl, {
    auth: { userId: auth.userId, token: auth.token },
    transports: auth.transports,
  }) as ChatSocket;
}
