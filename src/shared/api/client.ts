import axios from "axios"
import { startProgress, stopProgress } from "@/lib/progress"

const api = axios.create({
  baseURL: "https://localhost:64318", // 🔁 change to your backend
  headers: {
    "Content-Type": "application/json",
  },
})

// Optional: attach token automatically later
api.interceptors.request.use((config) => {
  startProgress()

  const token = localStorage.getItem("token")

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

export default api