import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getUsers,
  getUser,
  upsertUser,
  type UpsertUserPayload,
} from "../api/user.api"

export const useUsers = (clientId: number | null) =>
  useQuery({
    queryKey: ["users", clientId],
    queryFn: () => getUsers(clientId!),
    enabled: clientId !== null,
  })

export const useUser = (id: number | null) =>
  useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id!),
    enabled: id !== null,
  })

export const useUpsertUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertUserPayload) => upsertUser(payload),
    onSuccess: (_data, variables) => {
      toast.success("User saved successfully.")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ["user", variables.id] })
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save user.")
    },
  })
}
