export type ApiResponse<T> = {
  success: boolean
  data: T
  traceId?: string
  error?: {
    code: string
    message: string
  }
}