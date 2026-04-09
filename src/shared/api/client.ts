import axios from "axios"
import { startProgress, stopProgress } from "@/lib/progress"
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
  startProgress()

  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// RESPONSE
api.interceptors.response.use(
  (response) => {
    stopProgress()
    return response
  },
  (error) => {
    stopProgress()
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
          window.location.replace("/sign-in")
        }, 300)
      }
    }

    return Promise.reject(err)
  }
)

export default api