import { createFileRoute, redirect } from "@tanstack/react-router"
import DashboardPage from "@/features/dashboard/pages/DashboardPage"
import { getToken } from "@/shared/lib/auth"

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: () => {
    const token = getToken()

    if (!token) {
      throw redirect({ to: "/sign-in" })
    }
  },
  component: DashboardPage,
})