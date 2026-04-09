import type { ApiResponse } from "@/shared/types/api"

export function unwrap<T>(res: { data: ApiResponse<T> }): T {
  const body = res.data

  if (!body.success) {
    throw new Error(body.error?.message || "Something went wrong")
  }

  return body.data
}