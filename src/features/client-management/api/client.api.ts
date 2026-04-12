import api from "@/shared/api/client"

export type ClientDto = {
  id: number
  name: string
  industry?: string
  location?: string
  contactEmail?: string
  contactPhone?: string
  tier?: string
  onBoardingDate?: string
  isActive: boolean
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
  search?: string
  sort?: string
  tier?: string[]
  isActive?: string[]
}

export const getClients = async (params: ClientListParams): Promise<ClientListResponse> => {
  const res = await api.get("/api/Client", { params })
  const data = res.data.data
  return {
    items: data?.items ?? data ?? [],
    total: data?.total ?? data?.length ?? 0,
    page: data?.page ?? params.page ?? 1,
    pageSize: data?.pageSize ?? params.pageSize ?? 10,
  }
}

export const deleteClient = async (id: number): Promise<void> => {
  await api.delete(`/api/Client/${id}`)
}
