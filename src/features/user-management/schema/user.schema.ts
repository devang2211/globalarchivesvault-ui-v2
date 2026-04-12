import { z } from "zod"

export const userSchema = z
  .object({
    id: z.number().nullable(),
    name: z.string().min(1, "Name is required").max(200),
    email: z.string().email("Valid email required"),
    password: z.string().max(100),
    isActive: z.boolean(),
    clientId: z.number().nullable(),
    roles: z.array(z.object({ roleId: z.number() })),
    permissions: z.array(
      z.object({
        permissionCode: z.string(),
        isAllowed: z.boolean(),
      })
    ),
    taxonomyLevel4s: z.array(
      z.object({
        taxonomyLevel4Id: z.number(),
        isAllowed: z.boolean(),
        canUpload: z.boolean(),
        canSearch: z.boolean(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    if (data.id === null && data.password.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required when creating a new user",
        path: ["password"],
      })
    }
  })

export type UserForm = z.infer<typeof userSchema>
