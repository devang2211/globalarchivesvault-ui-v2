import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getMetadataFieldLookup,
  getMetadataFieldById,
  upsertMetadataField,
  type UpsertMetadataFieldPayload,
} from "../api/metadata.api"

export const useMetadataFieldLookup = () =>
  useQuery({
    queryKey: ["metadata-fields"],
    queryFn: getMetadataFieldLookup,
  })

export const useMetadataFieldById = (id: number | null) =>
  useQuery({
    queryKey: ["metadata-field", id],
    queryFn: () => getMetadataFieldById(id!),
    enabled: id !== null,
  })

export const useUpsertMetadataField = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertMetadataFieldPayload) => upsertMetadataField(payload),
    onSuccess: () => {
      toast.success("Metadata field saved successfully.")
      queryClient.invalidateQueries({ queryKey: ["metadata-fields"] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save metadata field.")
    },
  })
}
