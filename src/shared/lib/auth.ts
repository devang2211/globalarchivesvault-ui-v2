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
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as AuthData
    const expiry = new Date(data.expiresAt)
    if (!data.expiresAt || isNaN(expiry.getTime()) || expiry <= new Date()) {
      localStorage.removeItem(AUTH_KEY)
      return null
    }
    return data
  } catch {
    localStorage.removeItem(AUTH_KEY)
    return null
  }
}

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY)
}

export const isTokenValid = (): boolean => {
  const auth = getAuth()
  if (!auth?.token || !auth?.expiresAt) return false
  return new Date(auth.expiresAt) > new Date()
}

export const getToken = () => getAuth()?.token

export const getUserType = () => getAuth()?.userType

export const hasRole = (roles: AuthData["userType"][]) => {
  const userType = getUserType()
  return userType ? roles.includes(userType) : false
}

export const isSuperAdmin = () => getUserType() === "SuperAdmin"

export const isClientAdmin = () => getUserType() === "ClientAdmin"

export const isClientUser = () => getUserType() === "ClientUser"
