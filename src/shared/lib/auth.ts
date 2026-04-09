export type AuthData = {
  token: string
  expiresAt: string
  userId: number
  name: string
  email: string
  userType: "SuperAdmin" | "ClientAdmin" | "ClientUser"
}

const AUTH_KEY = "auth"

export const setAuth = (data: AuthData) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data))
}

export const getAuth = (): AuthData | null => {
  const raw = localStorage.getItem(AUTH_KEY)
  return raw ? JSON.parse(raw) : null
}

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY)
}

// 🔥 helpers (no parsing everywhere)
export const getToken = () => getAuth()?.token

export const getUserType = () => getAuth()?.userType

export const hasRole = (roles: AuthData["userType"][]) => {
  const userType = getUserType()
  return userType ? roles.includes(userType) : false
}

export const getUser = () => {
  const data = localStorage.getItem("auth")
  return data ? JSON.parse(data) : null
}

export const isSuperAdmin = () => getUserType() === "SuperAdmin"

export const isClientAdmin = () => getUserType() === "ClientAdmin"

export const isClientUser = () => getUserType() === "ClientUser"
