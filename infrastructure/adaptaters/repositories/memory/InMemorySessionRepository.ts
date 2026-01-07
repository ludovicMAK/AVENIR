import { SessionRepository } from "@application/repositories/session";
import { Session } from "@domain/entities/session";

export class InMemorySessionRepository implements SessionRepository {
  private sessions: Map<string, Session> = new Map();
  async createSession(session: Session): Promise<void> {
    this.sessions.set(session.id, session);
  }
  async isConnected(userId: string, token: string): Promise<boolean> {
    for (const session of this.sessions.values()) {
      if (
        session.userId === userId &&
        session.refreshToken === token &&
        session.expirationAt > new Date()
      ) {
        return true;
      }
    }
    return false;
  }

  async getUserIdByToken(token: string): Promise<string | null> {
    for (const session of this.sessions.values()) {
      if (session.refreshToken === token && session.expirationAt > new Date()) {
        return session.userId;
      }
    }
    return null;
  }
}
