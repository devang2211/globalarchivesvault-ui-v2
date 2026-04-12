import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  upsertTaxonomyLevel1,
  upsertTaxonomyLevel2,
  upsertTaxonomyLevel3,
  upsertTaxonomyLevel4,
  type UpsertTaxonomyLevel1Payload,
  type UpsertTaxonomyLevel2Payload,
  type UpsertTaxonomyLevel3Payload,
  type UpsertTaxonomyLevel4Payload,
} from "../api/taxonomy.api"

/* Re-export query hooks so the page only needs one import path */
export {
  useTaxonomyLevel1s,
  useTaxonomyLevel2s,
  useTaxonomyLevel3s,
  useTaxonomyLevel4s,
} from "@/features/role-management/hooks/useRoles"

/* ---------------------------------- */
/* MUTATION HOOKS                     */
/* ---------------------------------- */

export const useUpsertTaxonomyLevel1 = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertTaxonomyLevel1Payload) => upsertTaxonomyLevel1(payload),
    onSuccess: () => {
      toast.success("Industry saved.")
      queryClient.invalidateQueries({ queryKey: ["taxonomy-level1"] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save.")
    },
  })
}

export const useUpsertTaxonomyLevel2 = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertTaxonomyLevel2Payload) => upsertTaxonomyLevel2(payload),
    onSuccess: (_data, variables) => {
      toast.success("Sub-Industry saved.")
      queryClient.invalidateQueries({ queryKey: ["taxonomy-level2", variables.taxonomyLevel1Id] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save.")
    },
  })
}

export const useUpsertTaxonomyLevel3 = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertTaxonomyLevel3Payload) => upsertTaxonomyLevel3(payload),
    onSuccess: (_data, variables) => {
      toast.success("Institution Type saved.")
      queryClient.invalidateQueries({ queryKey: ["taxonomy-level3", variables.taxonomyLevel2Id] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save.")
    },
  })
}

export const useUpsertTaxonomyLevel4 = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertTaxonomyLevel4Payload) => upsertTaxonomyLevel4(payload),
    onSuccess: (_data, variables) => {
      toast.success("Institution Name saved.")
      queryClient.invalidateQueries({ queryKey: ["taxonomy-level4", variables.taxonomyLevel3Id] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save.")
    },
  })
}
