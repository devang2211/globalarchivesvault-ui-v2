export const formatUserType = (type?: string) => {
  if (!type) return ""

  return type
    .replace(/([A-Z])/g, " $1")
    .trim()
}