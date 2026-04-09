import type { AuthData } from "@/shared/lib/auth"

export type LoginRequest = {
  email: string
  password: string
}

export type ApiError = {
  code: string
  message: string
}

export type LoginResponse = {
  success: boolean,
  data: AuthData | null,
  traceId: string,
  error: ApiError | null
}