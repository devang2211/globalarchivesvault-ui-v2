import api from "@/shared/api/client"
import { unwrap } from "@/shared/api/unwrap"
import type { ApiResponse } from "@/shared/types/api"

/* ---------------------------------- */
/* DTOs                               */
/* ---------------------------------- */

export type MetadataFieldLookupDto = {
  id: number
  name: string
  dataType: string
  isSearchable: boolean
  isEncrypted: boolean
  isMasked: boolean
}

export type MetadataFieldDto = {
  id: number
  name: string
  dataType: string
  isEncrypted: boolean
  isMasked: boolean
  isSearchable: boolean
  createdAt: string
  createdBy: number
  updatedAt: string | null
  updatedBy: number | null
}

/* ---------------------------------- */
/* PAYLOAD TYPES                      */
/* ---------------------------------- */

export type UpsertMetadataFieldPayload = {
  id: number | null
  name: string
  dataType: string
  isEncrypted: boolean
  isMasked: boolean
  isSearchable: boolean
}

/* ---------------------------------- */
/* API FUNCTIONS                      */
/* ---------------------------------- */

export const getMetadataFieldLookup = async (): Promise<MetadataFieldLookupDto[]> => {
  const res = await api.get<ApiResponse<MetadataFieldLookupDto[]>>("/api/MetadataField/lookup")
  return unwrap(res) ?? []
}

export const getMetadataFieldById = async (id: number): Promise<MetadataFieldDto> => {
  const res = await api.get<ApiResponse<MetadataFieldDto>>(`/api/MetadataField/${id}`)
  return unwrap(res)
}

export const upsertMetadataField = async (
  payload: UpsertMetadataFieldPayload
): Promise<void> => {
  await api.post<ApiResponse<{ message: string }>>("/api/MetadataField/upsert", payload)
}
