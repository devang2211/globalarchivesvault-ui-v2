import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Invalid email address" }),

  password: z
    .string()
    .trim()
    .min(1, { message: "Please enter your password" }),
})

export type LoginFormValues = z.infer<typeof loginSchema>