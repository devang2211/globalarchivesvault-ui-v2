import api from "@/shared/api/client"

export type Preferences = {
  theme?: "light" | "dark" | "system"
  font?: "inter" | "manrope" | "system"
  density?: "comfortable" | "compact"
}

export const getPreferences = async () => {
  const res = await api.get<Preferences>("/api/preferences")
  return res.data
}

export const updatePreferences = async (data: Partial<Preferences>) => {
  const res = await api.put("/api/preferences", data)
  return res.data
}