import api from "@/shared/api/client"
import type { LoginRequest, LoginResponse } from "../types/auth.types"

export const login = async (data: LoginRequest) => {
  try {
    const res = await api.post<LoginResponse>("/api/auth/sign-in", data)
    return res.data
  } catch (err: any) {
    const message =
      err?.response?.data?.error?.message ||
      "Unable to connect to server"

    throw new Error(message)
  }
}