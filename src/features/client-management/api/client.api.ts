import api from "@/shared/api/client"
import type { ApiResponse } from "@/shared/types/api"
import { unwrap } from "@/shared/api/unwrap"

export type ClientDto = {
  id: number
  name: string
  pricingTier?: string
  taxonomyLevel1Name?: string
  taxonomyLevel2Name?: string
  onBoardingDate?: string
  isActive: boolean
  regulatoryFrameworks?: string | null
}

export type ClientListResponse = {
  items: ClientDto[]
  total: number
  page: number
  pageSize: number
}

export type ClientListParams = {
  page?: number
  pageSize?: number
  status?: boolean[]
  pricingTierId?: number[]
  sort?: string
}

type PagedResult = {
  data: ClientDto[]
  total: number
  page: number
  pageSize: number
}

export const getClients = async (params: ClientListParams): Promise<ClientListResponse> => {
  const res = await api.get<ApiResponse<PagedResult>>("/api/client", { params })
  const result = unwrap(res)
  return {
    items: result?.data ?? [],
    total: result?.total ?? 0,
    page: result?.page ?? params.page ?? 1,
    pageSize: result?.pageSize ?? params.pageSize ?? 10,
  }
}

export type ClientDetailDto = {
  id: number
  version: number
  name: string
  tierId: number
  appTimeZoneId?: number | null
  taxonomyLevel2Id?: number | null
  location?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  onBoardingDate?: string | null
  isActive: boolean
  regulatoryFrameworks?: { regulatoryFrameworkId: number; isAllowed: boolean }[] | null
  permissions?: { permissionCode: string; isAllowed: boolean }[] | null
}

export const getClient = async (id: number): Promise<ClientDetailDto> => {
  const res = await api.get<ApiResponse<ClientDetailDto>>(`/api/client/${id}`)
  return unwrap(res)!
}

export const deleteClient = async (id: number): Promise<void> => {
  await api.delete(`/api/client/${id}`)
}
