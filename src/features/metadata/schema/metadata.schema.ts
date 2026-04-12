import { z } from "zod"

export const DATA_TYPES = ["text", "number", "date", "boolean", "lookup"] as const

export const metadataFieldSchema = z.object({
  id: z.number().nullable(),
  name: z.string().min(1, "Name is required").max(200, "Max 200 characters"),
  dataType: z.enum(DATA_TYPES, { message: "Data type is required" }),
  isEncrypted: z.boolean(),
  isMasked: z.boolean(),
  isSearchable: z.boolean(),
})

export type MetadataFieldForm = z.infer<typeof metadataFieldSchema>
