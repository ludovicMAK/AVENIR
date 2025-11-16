import zod from "zod"

export const RegisterUserSchema = zod.object({
    lastname: zod.string().min(1),
    firstname: zod.string().min(1),
    email: zod.string().email(),
    password: zod.string().min(8),
})
