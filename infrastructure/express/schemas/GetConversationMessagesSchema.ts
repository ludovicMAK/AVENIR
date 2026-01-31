import { z } from "zod";
import { uuid } from "./uuid";

export const GetConversationMessagesSchema = z.object({
  conversationId: uuid("Invalid conversation ID format"),
  userId: uuid("Invalid user ID format"),
});

export type GetConversationMessagesInput = z.infer<
  typeof GetConversationMessagesSchema
>;
