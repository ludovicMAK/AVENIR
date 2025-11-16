import zod from "zod"

export const RegisterUserSchema = zod.object({
    lastname: zod.string().min(1, { message: "Lastname is required." }),
    firstname: zod.string().min(1, { message: "Firstname is required." }),
    email: zod.string().email({ message: "Email must be valid." }),
    password: zod.string().min(8, { message: "Password must be at least 8 characters long." }),
})
