import { z } from "zod";

export const GetConversationMessagesSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID format"),
  userId: z.string().uuid("Invalid user ID format"),
});

export type GetConversationMessagesInput = z.infer<
  typeof GetConversationMessagesSchema
>;
