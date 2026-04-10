import axios from "axios"
import { startApiProgress, stopApiProgress } from "@/lib/progress"
import { clearAuth, getToken } from "@/shared/lib/auth"
import { toast } from "sonner"

const api = axios.create({
  baseURL: "https://localhost:64318", // 🔁 change to your backend
  headers: {
    "Content-Type": "application/json",
  },
})

// Optional: attach token automatically later
api.interceptors.request.use((config) => {
  startApiProgress()

  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// RESPONSE
api.interceptors.response.use(
  (response) => {
    stopApiProgress()
    return response
  },
  (error) => {
    stopApiProgress()
    return Promise.reject(error)
  }
)

let isRedirecting = false // ✅ prevent multiple redirects

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 &&
  !err.config.url.includes("/auth/sign-in")) {
      if (!isRedirecting) {
        isRedirecting = true

        clearAuth()

        // Optional UX
        toast.error("Session expired. Please sign in again.")

        // ✅ SPA-safe redirect
        setTimeout(() => {
          isRedirecting = false
          window.location.replace("/sign-in")
        }, 300)
      }
    }

    return Promise.reject(err)
  }
)

export default api