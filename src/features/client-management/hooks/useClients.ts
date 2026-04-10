import { useQuery } from "@tanstack/react-query"
import { getClients } from "../api/client.api"

export const useClients = (search: any) => {
  return useQuery({
    queryKey: ["clients", search],
    queryFn: () => getClients(search),
    keepPreviousData: true,
  })
}