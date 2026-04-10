import api from "@/shared/api/client"

export type ClientDto = {
  id: number
  name: string
  industry: string
  location: string
  email: string
  phone: string
  tier: string
  startDate: string
}

export type ClientResponse = {
  items: ClientDto[]
  total: number
}

// export const getClients = async (params: {
//   page: number
//   pageSize: number
//   search?: string
//   sort?: string
// }) => {
//   const res = await api.get("/api/client", { params })
//   return res.data.data as ClientResponse
// }

export const getClients = async (params: any) => {
  const res = await api.get("/api/clients", { params })
  return res.data.data
}