import api from "@/shared/api/client"
import type { ApiResponse } from "@/shared/types/api"
import { unwrap } from "@/shared/api/unwrap"

export type TierDto = {
  id: number
  name: string
}

export type TierPermissionDto = {
  permissionCode: string
  isAllowed: boolean
  version: number
}

export const getTiers = async () => {
  const res = await api.get<ApiResponse<TierDto[]>>("/api/tier")
  return unwrap(res)
}

export const getTierPermissions = async (tierId: number) => {
  const res = await api.get<ApiResponse<TierPermissionDto[]>>(`/api/tier-permissions/${tierId}`)
  return unwrap(res)
}

export const saveTierPermissions = async (tierId: number, permissions: TierPermissionDto[]) => {
  const res = await api.post<ApiResponse<unknown>>("/api/tier-permissions/configure", {
    tierId,
    permissions,
  })
  return unwrap(res)
}