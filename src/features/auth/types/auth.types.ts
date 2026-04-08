export type LoginRequest = {
  email: string
  password: string
}

export type ApiError = {
  code: string
  message: string
}

export type LoginData = {
  token: string
  expiresAt: string
  userId: number
  name: string
  email: string
}

export type LoginResponse = {
  success: boolean,
  data: LoginData | null,
  traceId: string,
  error: ApiError | null
}