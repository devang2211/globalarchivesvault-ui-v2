import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getRoles,
  getRole,
  upsertRole,
  activateRole,
  deactivateRole,
  getTaxonomyLevel1s,
  getTaxonomyLevel2s,
  getTaxonomyLevel3s,
  getTaxonomyLevel4s,
  type UpsertRolePayload,
} from "../api/role.api"

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  })
}

export const useRole = (id: number | null) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => getRole(id!),
    enabled: id !== null,
  })
}

export const useTaxonomyLevel1s = () => {
  return useQuery({
    queryKey: ["taxonomy-level1"],
    queryFn: getTaxonomyLevel1s,
  })
}

export const useTaxonomyLevel2s = (level1Id: number | null) => {
  return useQuery({
    queryKey: ["taxonomy-level2", level1Id],
    queryFn: () => getTaxonomyLevel2s(level1Id!),
    enabled: level1Id !== null,
  })
}

export const useTaxonomyLevel3s = (level2Id: number | null) => {
  return useQuery({
    queryKey: ["taxonomy-level3", level2Id],
    queryFn: () => getTaxonomyLevel3s(level2Id!),
    enabled: level2Id !== null,
  })
}

export const useTaxonomyLevel4s = (level3Id: number | null) => {
  return useQuery({
    queryKey: ["taxonomy-level4", level3Id],
    queryFn: () => getTaxonomyLevel4s(level3Id!),
    enabled: level3Id !== null,
  })
}

export const useUpsertRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertRolePayload) => upsertRole(payload),
    onSuccess: (_data, variables) => {
      toast.success("Role saved successfully.")
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ["role", variables.id] })
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save role.")
    },
  })
}

export const useToggleRoleStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      isActive ? deactivateRole(id) : activateRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update role status.")
    },
  })
}
