import { ParticipantConversation } from "@domain/entities/participantConversation";

export interface ParticipantConversationRepository {
  save(participant: ParticipantConversation): Promise<void>;
  findById(id: string): Promise<ParticipantConversation | null>;
  findByConversationId(
    conversationId: string
  ): Promise<ParticipantConversation[]>;
  findActiveByConversationId(
    conversationId: string
  ): Promise<ParticipantConversation[]>;
  findByAdvisorId(advisorId: string): Promise<ParticipantConversation[]>;
  findByConversationIdAndAdvisorId(
    conversationId: string,
    advisorId: string
  ): Promise<ParticipantConversation | null>;
  findPrincipalByConversationId(
    conversationId: string
  ): Promise<ParticipantConversation | null>;
  updateDateEnd(participantId: string, dateEnd: Date): Promise<void>;
  delete(participantId: string): Promise<void>;
}
