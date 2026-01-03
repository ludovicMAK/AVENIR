import { z } from "zod";

export const CreateGroupConversationSchema = z.object({
  creatorId: z.string().uuid("Invalid creator ID format"),
  initialMessage: z
    .string()
    .min(1, "Initial message is required")
    .max(5000, "Message is too long"),
});

export type CreateGroupConversationInput = z.infer<
  typeof CreateGroupConversationSchema
>;
