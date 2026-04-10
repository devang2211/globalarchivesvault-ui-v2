import api from "@/shared/api/client"
import type { LoginRequest } from "../types/auth.types"
import type { ApiResponse } from "@/shared/types/api"
import type { AuthData } from "@/shared/lib/auth"
import { unwrap } from "@/shared/api/unwrap"

export const login = async (data: LoginRequest): Promise<AuthData> => {
  const res = await api.post<ApiResponse<AuthData>>("/api/auth/sign-in", data)
  return unwrap(res)
}

export const signOut = async () => {
  await api.post("/api/auth/sign-out")
}