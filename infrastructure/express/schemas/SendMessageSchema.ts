import { z } from "zod";

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID format"),
  senderId: z.string().uuid("Invalid sender ID format"),
  text: z
    .string()
    .min(1, "Message text is required")
    .max(5000, "Message is too long"),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
