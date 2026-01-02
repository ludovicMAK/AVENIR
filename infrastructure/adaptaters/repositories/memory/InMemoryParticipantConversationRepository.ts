import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { ParticipantConversation } from "@domain/entities/participantConversation";

export class InMemoryParticipantConversationRepository
  implements ParticipantConversationRepository
{
  private readonly items: Map<string, ParticipantConversation> = new Map();

  async save(participant: ParticipantConversation): Promise<void> {
    this.items.set(participant.id, participant);
  }

  async findById(id: string): Promise<ParticipantConversation | null> {
    return this.items.get(id) || null;
  }

  async findByConversationId(
    conversationId: string
  ): Promise<ParticipantConversation[]> {
    return Array.from(this.items.values()).filter(
      (participant) => participant.conversationId === conversationId
    );
  }

  async findActiveByConversationId(
    conversationId: string
  ): Promise<ParticipantConversation[]> {
    return Array.from(this.items.values()).filter(
      (participant) =>
        participant.conversationId === conversationId && participant.isActive()
    );
  }

  async findByAdvisorId(advisorId: string): Promise<ParticipantConversation[]> {
    return Array.from(this.items.values()).filter(
      (participant) => participant.advisorId === advisorId
    );
  }

  async findByConversationIdAndAdvisorId(
    conversationId: string,
    advisorId: string
  ): Promise<ParticipantConversation | null> {
    for (const participant of this.items.values()) {
      if (
        participant.conversationId === conversationId &&
        participant.advisorId === advisorId
      ) {
        return participant;
      }
    }
    return null;
  }

  async findPrincipalByConversationId(
    conversationId: string
  ): Promise<ParticipantConversation | null> {
    for (const participant of this.items.values()) {
      if (
        participant.conversationId === conversationId &&
        participant.isPrincipal()
      ) {
        return participant;
      }
    }
    return null;
  }

  async updateDateEnd(participantId: string, dateEnd: Date): Promise<void> {
    const participant = this.items.get(participantId);
    if (participant) {
      const updated = new ParticipantConversation(
        participant.id,
        participant.conversationId,
        participant.advisorId,
        participant.dateAdded,
        dateEnd,
        participant.estPrincipal
      );
      this.items.set(participantId, updated);
    }
  }

  async delete(participantId: string): Promise<void> {
    this.items.delete(participantId);
  }
}
