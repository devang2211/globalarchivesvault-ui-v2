import api from "@/shared/api/client"

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  isValid: boolean
  authMessage: string | null
  accessToken: string
  expiresAt: string | null
  isAdmin: boolean | null
}


export const login = async (data: LoginRequest) => {
  const res = await api.post<LoginResponse>("/api/auth/token", data)
  return res.data
}