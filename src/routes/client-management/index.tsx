import { createFileRoute, redirect } from "@tanstack/react-router"
import ClientManagementPage from "@/features/client-management/pages/ClientManagementPage"
import { getToken } from "@/shared/lib/auth"

export const Route = createFileRoute("/client-management/")({
  beforeLoad: () => {
    const token = getToken()

    if (!token) {
      throw redirect({ to: "/sign-in" })
    }
  },
  component: ClientManagementPage,
})