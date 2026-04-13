import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getMetadataFieldLookup,
  getRecordTypeConfig,
  saveRecordTypeConfig,
  type SaveRecordTypeConfigPayload,
} from "../api/document-type.api"

export const useMetadataFieldLookup = () => {
  return useQuery({
    queryKey: ["metadata-field-lookup"],
    queryFn: getMetadataFieldLookup,
    staleTime: 5 * 60 * 1000,
  })
}

export const useRecordTypeConfig = (level4Id: number | null) => {
  return useQuery({
    queryKey: ["record-type-config", level4Id],
    queryFn: () => getRecordTypeConfig(level4Id!),
    enabled: level4Id !== null,
  })
}

export const useSaveRecordTypeConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SaveRecordTypeConfigPayload) => saveRecordTypeConfig(payload),
    onSuccess: (_data, variables) => {
      toast.success("Configuration saved.")
      queryClient.invalidateQueries({ queryKey: ["record-type-config", variables.taxonomyLevel4Id] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save configuration.")
    },
  })
}
