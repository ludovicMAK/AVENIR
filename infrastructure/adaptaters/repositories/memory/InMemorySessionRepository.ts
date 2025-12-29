import { SessionRepository } from "@application/repositories/session";
import { Session } from "@domain/entities/session";

export class InMemorySessionRepository
  implements SessionRepository
  
{
    private sessions: Map<string, Session> = new Map();
    async createSession(session: Session): Promise<void> {
        this.sessions.set(session.id, session);
    }
}
