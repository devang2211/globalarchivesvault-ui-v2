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

// Raw shape returned by /api/MetadataField/lookup
type RawMetadataFieldLookupDto = {
  id: number
  name: string
  dataType: string
  isSearchable: boolean
  isEncrypted: boolean
  isMasked: boolean
}

function mapRawToMetadataField(raw: RawMetadataFieldLookupDto): MetadataFieldLookupDto {
  const typeMap: Record<string, FieldType> = {
    text: "text", Text: "text",
    number: "number", Number: "number",
    date: "date", Date: "date",
    lookup: "lookup", Lookup: "lookup",
    boolean: "boolean", Boolean: "boolean",
  }
  return {
    id: String(raw.id),
    name: raw.name,
    displayName: raw.name,
    type: typeMap[raw.dataType] ?? "text",
    searchable: raw.isSearchable,
    encrypted: raw.isEncrypted,
    masked: raw.isMasked,
    options: [],
  }
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

export type RegulatoryFrameworkDto = {
  id: number
  name: string
  code: string
}

/* ---------------------------------- */
/* API FUNCTIONS                       */
/* ---------------------------------- */

export const getRegulatoryFrameworks = async (): Promise<RegulatoryFrameworkDto[]> => {
  const res = await api.get<ApiResponse<RegulatoryFrameworkDto[]>>("/api/Lookups/regulatory-frameworks")
  return unwrap(res) ?? []
}

export const getMetadataFieldLookup = async (): Promise<MetadataFieldLookupDto[]> => {
  const res = await api.get<ApiResponse<RawMetadataFieldLookupDto[]>>("/api/MetadataField/lookup")
  const raw = unwrap(res) ?? []
  return raw.map(mapRawToMetadataField)
}

export const getRecordTypeConfig = async (level4Id: number): Promise<RecordTypeConfigDto | null> => {
  const res = await api.get<ApiResponse<RecordTypeConfigDto>>(`/api/Taxonomy/getconfig/${level4Id}`)
  return unwrap(res) ?? null
}

export const saveRecordTypeConfig = async (payload: SaveRecordTypeConfigPayload): Promise<void> => {
  await api.post("/api/Taxonomy/saveconfig", payload)
}
