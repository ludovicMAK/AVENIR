import zod from "zod"

export const LoginUserSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(1),
})
