import { z } from "zod";
import { uuid } from "./uuid";

export const GetConversationParticipantsSchema = z.object({
  conversationId: uuid("Invalid conversation ID format"),
});

export type GetConversationParticipantsInput = z.infer<
  typeof GetConversationParticipantsSchema
>;

