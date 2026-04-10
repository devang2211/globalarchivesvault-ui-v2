import { z } from "zod"

export const clientSchema = z.object({
  id: z.number(),

  name: z
    .string()
    .min(1, "Name is required")
    .max(200),

  status: z.enum(["active", "inactive"]),

  location: z.string().max(200).optional(),

  email: z
    .string()
    .email("Invalid email")
    .max(320)
    .optional()
    .or(z.literal("")),

  phone: z.string().max(50).optional(),

  timezoneId: z.number().nullable().optional(),

tierId: z.preprocess(
  (val) => (val === "" || val === undefined ? undefined : Number(val)),
  z.number().min(1, "Pricing tier is required")
),

  startDate: z.string().min(1, "Start date is required"),

  industryId: z.number().optional(),

  frameworkIds: z.array(z.number()).optional(),

  permissions: z.array(
    z.object({
      permissionId: z.number(),
      isAllowed: z.boolean(),
    })
  ),
})

export type ClientForm = z.infer<typeof clientSchema>