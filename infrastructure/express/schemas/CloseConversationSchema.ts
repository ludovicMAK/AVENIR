import { z } from "zod";
import { uuid } from "./uuid";

export const CloseConversationSchema = z.object({
  conversationId: uuid("Invalid conversation ID format"),
  userId: uuid("Invalid user ID format"),
});

export type CloseConversationInput = z.infer<typeof CloseConversationSchema>;
