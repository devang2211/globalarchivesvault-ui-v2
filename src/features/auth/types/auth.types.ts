export type LoginRequest = {
  email: string
  password: string
}

export type ApiError = {
  code: string
  message: string
}

export type LoginResponse = {
  success: boolean
  error: ApiError | null
  accessToken?: string
  expiresAt?: string | null
  isAdmin?: boolean | null
}