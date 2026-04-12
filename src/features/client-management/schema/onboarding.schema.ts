import { z } from "zod"

export const clientDetailsSchema = z.object({
  id: z.number(),

  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or less"),

  appTimezoneId: z.number().nullable().optional(),

  location: z
    .string()
    .max(200, "Location must be 200 characters or less")
    .optional()
    .or(z.literal("")),

  contactEmail: z
    .union([
      z.literal(""),
      z.string()
        .max(320, "Email must be 320 characters or less")
        .refine(
          (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
          { message: "Invalid email address" }
        ),
    ])
    .optional(),

  contactPhone: z
    .union([
      z.literal(""),
      z.string()
        .regex(
          /^(\+1[\s\-]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}$/,
          "Invalid phone number"
        )
        .max(50, "Phone must be 50 characters or less"),
    ])
    .optional(),

  isActive: z.boolean(),

  // Compliance
  taxonomyLevel2Id: z
    .number({ message: "Industry / Institution is required" })
    .nullable()
    .refine((val) => val !== null, { message: "Industry / Institution is required" })
    .transform((val) => val!),

  regulatoryFrameworks: z
    .array(z.object({ regulatoryFrameworkId: z.number() }))
    .min(1, "At least one regulatory framework is required"),

  // Subscription
  tierId: z.number({ message: "Pricing tier is required" }),
  startDate: z.string().min(1, "Start date is required"),
})

export type ClientDetailsForm = z.infer<typeof clientDetailsSchema>
