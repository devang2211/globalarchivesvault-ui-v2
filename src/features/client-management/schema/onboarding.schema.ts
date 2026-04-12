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
    .string()
    .email("Invalid email address")
    .max(320, "Email must be 320 characters or less")
    .optional()
    .or(z.literal("")),

  contactPhone: z
    .string()
    .max(50, "Phone must be 50 characters or less")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean(),

  // Compliance
  taxonomyLevel2Id: z.number().nullable().optional(),
  regulatoryFrameworkIds: z.array(z.number()).optional(),

  // Subscription
  tierId: z.number({ message: "Pricing tier is required" }),
  startDate: z.string().min(1, "Start date is required"),
})

export type ClientDetailsForm = z.infer<typeof clientDetailsSchema>
