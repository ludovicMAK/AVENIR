import { z } from "zod";
import { uuid } from "./uuid";

export const SendMessageSchema = z.object({
  conversationId: uuid("Invalid conversation ID format"),
  senderId: uuid("Invalid sender ID format"),
  text: z
    .string()
    .min(1, "Message text is required")
    .max(5000, "Message is too long"),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
