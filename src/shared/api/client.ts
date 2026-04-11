import axios from "axios"
import { startApiProgress, stopApiProgress } from "@/lib/progress"
import { clearAuth, getToken } from "@/shared/lib/auth"
import { toast } from "sonner"
import { routerRef } from "./routerRef"

const api = axios.create({
  baseURL: "https://localhost:64318",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  startApiProgress()

  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let isRedirecting = false

api.interceptors.response.use(
  (response) => {
    stopApiProgress()
    return response
  },
  (error) => {
    stopApiProgress()

    const status = error.response?.status
    const isSignInCall = error.config?.url?.includes("/auth/sign-in")
    const isSignOutCall = error.config?.url?.includes("/auth/sign-out")

    if (status === 401 && !isSignInCall && !isSignOutCall) {
      if (!isRedirecting) {
        isRedirecting = true
        clearAuth()
        toast.error("Session expired. Please sign in again.")

        setTimeout(() => {
          isRedirecting = false
          if (routerRef.current) {
            routerRef.current.navigate({ to: "/sign-in" })
          } else {
            window.location.replace("/sign-in")
          }
        }, 300)
      }
    }

    if (status === 403 && !isSignInCall) {
      if (routerRef.current) {
        routerRef.current.navigate({ to: "/errors/forbidden" })
      } else {
        window.location.replace("/errors/forbidden")
      }
    }

    return Promise.reject(error)
  }
)

export default api
