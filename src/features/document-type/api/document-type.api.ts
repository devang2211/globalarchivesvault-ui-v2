import api from "@/shared/api/client"
import type { ApiResponse } from "@/shared/types/api"
import { unwrap } from "@/shared/api/unwrap"

/* ---------------------------------- */
/* DTOs                                */
/* ---------------------------------- */

export type FieldType = "text" | "number" | "date" | "lookup" | "boolean"

export type MetadataFieldLookupDto = {
  id: string
  name: string
  displayName: string
  type: FieldType
  options?: string[]
  searchable?: boolean
  encrypted?: boolean
  masked?: boolean
}

export type LayoutItem = {
  id: string
  groupId: string
  groupName: string
  row: number
  column: 1 | 2
  field: MetadataFieldLookupDto & {
    encrypted: boolean
    masked: boolean
    searchable: boolean
    options: string[]
  }
}

export type RetentionRule = {
  id: string
  frameworkId?: number
  fieldId: string
  operator: string
  value: string
  triggerFieldId: string
  period: number
  unit: "Days" | "Months" | "Years"
}

export type RecordTypeConfigDto = {
  taxonomyLevel4Id: number
  permanentRetention: boolean
  layout: LayoutItem[]
  retentionRules: RetentionRule[]
}

export type SaveRecordTypeConfigPayload = {
  taxonomyLevel4Id: number
  clientId: number
  permanentRetention: boolean
  layout: LayoutItem[]
  retentionRules: RetentionRule[]
}

/* ---------------------------------- */
/* API FUNCTIONS                       */
/* ---------------------------------- */

export const getMetadataFieldLookup = async (): Promise<MetadataFieldLookupDto[]> => {
  const res = await api.get<ApiResponse<MetadataFieldLookupDto[]>>("/api/MetadataField/lookup")
  return unwrap(res) ?? []
}

export const getRecordTypeConfig = async (level4Id: number): Promise<RecordTypeConfigDto | null> => {
  const res = await api.get<ApiResponse<RecordTypeConfigDto>>(`/api/Taxonomy/getconfig/${level4Id}`)
  return unwrap(res) ?? null
}

export const saveRecordTypeConfig = async (payload: SaveRecordTypeConfigPayload): Promise<void> => {
  await api.post("/api/Taxonomy/saveconfig", payload)
}
