import api from "@/shared/api/client"
import type { ApiResponse } from "@/shared/types/api"
import { unwrap } from "@/shared/api/unwrap"

export type UserLookupItemDto = {
  id: number
  name: string
  email: string
  isActive: boolean
}

export type UserDetailDto = {
  id: number
  name: string
  email: string
  isActive: boolean
  clientId: number
  roles: { roleId: number; roleName: string }[]
  permissions: { permissionCode: string; isAllowed: boolean }[]
  taxonomyLevel4s: {
    taxonomyLevel4Id: number
    taxonomyLevel4Name: string
    isAllowed: boolean
    canUpload: boolean
    canSearch: boolean
  }[]
}

export type UpsertUserPayload = {
  id: number | null
  name: string
  email: string
  password: string
  isActive: boolean
  clientId?: number | null
  roles: { roleId: number }[]
  permissions: { permissionCode: string; isAllowed: boolean }[]
  taxonomyLevel4s: {
    taxonomyLevel4Id: number
    isAllowed: boolean
    canUpload: boolean
    canSearch: boolean
  }[]
}

export const getUsers = async (clientId: number): Promise<UserLookupItemDto[]> => {
  const res = await api.get<ApiResponse<UserLookupItemDto[]>>("/api/user/lookup", {
    params: { clientId },
  })
  return unwrap(res) ?? []
}

export const getUser = async (id: number): Promise<UserDetailDto> => {
  const res = await api.get<ApiResponse<UserDetailDto>>(`/api/user/${id}`)
  return unwrap(res)!
}

export const upsertUser = async (payload: UpsertUserPayload): Promise<{ id: number }> => {
  const res = await api.post<ApiResponse<{ id: number }>>("/api/user/upsert", payload)
  return unwrap(res)!
}
