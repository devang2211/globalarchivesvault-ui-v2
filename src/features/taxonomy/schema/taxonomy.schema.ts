import { z } from "zod"

const base = z.object({
  id: z.number().nullable().optional(),
  name: z.string().min(1, "Name is required").max(200, "Max 200 characters"),
  isActive: z.boolean(),
})

export const level1Schema = base

export const level2Schema = base.extend({
  taxonomyLevel1Id: z.number().min(1, "Parent is required"),
})

export const level3Schema = base.extend({
  taxonomyLevel2Id: z.number().min(1, "Parent is required"),
})

export const level4Schema = base.extend({
  taxonomyLevel3Id: z.number().min(1, "Parent is required"),
})

export type Level1Form = z.infer<typeof level1Schema>
export type Level2Form = z.infer<typeof level2Schema>
export type Level3Form = z.infer<typeof level3Schema>
export type Level4Form = z.infer<typeof level4Schema>
