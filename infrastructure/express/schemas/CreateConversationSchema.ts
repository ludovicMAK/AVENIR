import { z } from "zod";

export const CreateConversationSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID format"),
  initialMessage: z
    .string()
    .min(1, "Initial message is required")
    .max(5000, "Message is too long"),
  assignedAdvisorId: z.string().uuid("Invalid advisor ID format"),
  type: z.enum(["private", "group"]).optional().default("private"),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
