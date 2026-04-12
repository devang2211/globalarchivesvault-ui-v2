import api from "@/shared/api/client"
import type { ApiResponse } from "@/shared/types/api"

/* ---------------------------------- */
/* RE-EXPORT TAXONOMY DTOs & GETTERS  */
/* ---------------------------------- */

export type {
  TaxonomyLevel1Dto,
  TaxonomyLevel2Dto,
  TaxonomyLevel3Dto,
  TaxonomyLevel4Dto,
} from "@/features/role-management/api/role.api"

export {
  getTaxonomyLevel1s,
  getTaxonomyLevel2s,
  getTaxonomyLevel3s,
  getTaxonomyLevel4s,
} from "@/features/role-management/api/role.api"

/* ---------------------------------- */
/* UPSERT PAYLOAD TYPES               */
/* ---------------------------------- */

export type UpsertTaxonomyLevel1Payload = {
  id?: number | null
  name: string
  isActive: boolean
}

export type UpsertTaxonomyLevel2Payload = {
  id?: number | null
  name: string
  taxonomyLevel1Id: number
  isActive: boolean
}

export type UpsertTaxonomyLevel3Payload = {
  id?: number | null
  name: string
  taxonomyLevel2Id: number
  isActive: boolean
}

export type UpsertTaxonomyLevel4Payload = {
  id?: number | null
  name: string
  taxonomyLevel3Id: number
  isActive: boolean
}

/* ---------------------------------- */
/* UPSERT API FUNCTIONS               */
/* ---------------------------------- */

export const upsertTaxonomyLevel1 = async (
  payload: UpsertTaxonomyLevel1Payload
): Promise<void> => {
  await api.post<ApiResponse<{ message: string }>>("/api/taxonomy/level1/upsert", payload)
}

export const upsertTaxonomyLevel2 = async (
  payload: UpsertTaxonomyLevel2Payload
): Promise<void> => {
  await api.post<ApiResponse<{ message: string }>>("/api/taxonomy/level2/upsert", payload)
}

export const upsertTaxonomyLevel3 = async (
  payload: UpsertTaxonomyLevel3Payload
): Promise<void> => {
  await api.post<ApiResponse<{ message: string }>>("/api/taxonomy/level3/upsert", payload)
}

export const upsertTaxonomyLevel4 = async (
  payload: UpsertTaxonomyLevel4Payload
): Promise<void> => {
  await api.post<ApiResponse<{ message: string }>>("/api/taxonomy/level4/upsert", payload)
}
