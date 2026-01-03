import { z } from "zod";

export const CloseConversationSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID format"),
  userId: z.string().uuid("Invalid user ID format"),
});

export type CloseConversationInput = z.infer<typeof CloseConversationSchema>;
