import { infer as zodInfer } from "zod";
import { RegisterUserSchema } from "@/infrastructure/express/src/schemas/RegisterUserSchema";

export type RegisterUserDto = zodInfer<typeof RegisterUserSchema>;

