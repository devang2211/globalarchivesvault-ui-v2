import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"
import { toast } from "sonner"

function DashboardPage() {
  useEffect(() => {
    const email = localStorage.getItem("userEmail")

    if (email) {
      toast.success(`Welcome, ${email}!`)
      localStorage.removeItem("userEmail")
    }
  }, [])

  return <div>Dashboard</div>
}

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
})