import { Session } from "@domain/entities/session";
import { User } from "@domain/entities/users";

export interface SessionRepository {
  createSession(Session: Session): Promise<void>;
  isConnected(userId: string, token: string): Promise<boolean>;
  getUserIdByToken(token: string): Promise<string | null>;
}
