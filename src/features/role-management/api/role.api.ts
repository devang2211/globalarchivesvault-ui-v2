import api from "@/shared/api/client"
import type { ApiResponse } from "@/shared/types/api"
import { unwrap } from "@/shared/api/unwrap"

/* ---------------------------------- */
/* ROLE DTOs */
/* ---------------------------------- */

export type RoleListItemDto = {
  id: number
  name: string
  isActive: boolean
}

export type RolePermissionDto = {
  permissionCode: string
  isAllowed: boolean
}

export type RoleTaxonomyLevel4Dto = {
  taxonomyLevel4Id: number
  taxonomyLevel4Name: string
  isAllowed: boolean
  canUpload: boolean
  canSearch: boolean
}

export type RoleDetailDto = {
  id: number
  version: number
  name: string
  isHidden: boolean
  isActive: boolean
  permissions: RolePermissionDto[]
  taxonomyLevel4s: RoleTaxonomyLevel4Dto[]
}

export type UpsertRolePayload = {
  id: number | null
  version: number
  name: string
  isActive: boolean
  permissions: { permissionCode: string; isAllowed: boolean }[]
  taxonomyLevel4s: {
    taxonomyLevel4Id: number
    isAllowed: boolean
    canUpload: boolean
    canSearch: boolean
  }[]
}

/* ---------------------------------- */
/* TAXONOMY DTOs */
/* ---------------------------------- */

export type TaxonomyLevel1Dto = {
  id: number
  name: string
}

export type TaxonomyLevel2Dto = {
  id: number
  name: string
  taxonomyLevel1Id: number
}

export type TaxonomyLevel3Dto = {
  id: number
  name: string
  taxonomyLevel2Id: number
}

export type TaxonomyLevel4Dto = {
  id: number
  name: string
  taxonomyLevel3Id: number
}

/* ---------------------------------- */
/* ROLE API FUNCTIONS */
/* ---------------------------------- */

export const getRoles = async (): Promise<RoleListItemDto[]> => {
  const res = await api.get<ApiResponse<RoleListItemDto[]>>("/api/role/lookup")
  return unwrap(res) ?? []
}

export const getRole = async (id: number): Promise<RoleDetailDto> => {
  const res = await api.get<ApiResponse<RoleDetailDto>>(`/api/role/${id}`)
  return unwrap(res)!
}

export const upsertRole = async (payload: UpsertRolePayload): Promise<void> => {
  await api.post("/api/role/upsert", payload)
}

export const activateRole = async (id: number): Promise<void> => {
  await api.patch(`/api/role/${id}/activate`)
}

export const deactivateRole = async (id: number): Promise<void> => {
  await api.patch(`/api/role/${id}/deactivate`)
}

/* ---------------------------------- */
/* TAXONOMY API FUNCTIONS */
/* ---------------------------------- */

export const getTaxonomyLevel1s = async (): Promise<TaxonomyLevel1Dto[]> => {
  const res = await api.get<ApiResponse<TaxonomyLevel1Dto[]>>("/api/taxonomy/level1")
  return unwrap(res) ?? []
}

export const getTaxonomyLevel2s = async (level1Id: number): Promise<TaxonomyLevel2Dto[]> => {
  const res = await api.get<ApiResponse<TaxonomyLevel2Dto[]>>("/api/taxonomy/level2", {
    params: { level1Id },
  })
  return unwrap(res) ?? []
}

export const getTaxonomyLevel3s = async (level2Id: number): Promise<TaxonomyLevel3Dto[]> => {
  const res = await api.get<ApiResponse<TaxonomyLevel3Dto[]>>("/api/taxonomy/level3", {
    params: { level2Id },
  })
  return unwrap(res) ?? []
}

export const getTaxonomyLevel4s = async (level3Id: number): Promise<TaxonomyLevel4Dto[]> => {
  const res = await api.get<ApiResponse<TaxonomyLevel4Dto[]>>("/api/taxonomy/level4", {
    params: { level3Id },
  })
  return unwrap(res) ?? []
}
