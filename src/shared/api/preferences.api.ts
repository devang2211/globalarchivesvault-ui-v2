import api from "@/shared/api/client"
import type { Preferences } from "@/shared/types/preferences.types"

export const getPreferences = async () => {
  const res = await api.get<Preferences>("/api/preferences")
  return res.data
}

export const updatePreferences = async (data: Partial<Preferences>) => {
  const res = await api.put("/api/preferences", data)
  return res.data
}