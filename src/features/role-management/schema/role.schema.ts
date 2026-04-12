import { z } from "zod"

export const roleSchema = z.object({
  id: z.number().nullable(),
  version: z.number(),
  name: z.string().min(1, "Name is required").max(200, "Name must be 200 characters or less"),
  isActive: z.boolean(),
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

export type RoleForm = z.infer<typeof roleSchema>
