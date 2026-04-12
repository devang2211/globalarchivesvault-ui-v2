import { createFileRoute, redirect } from "@tanstack/react-router"
import { ClientDetailsPage } from "@/features/client-management/pages/ClientDetailsPage"
import { hasRole } from "@/shared/lib/auth"

export const Route = createFileRoute("/client-management/details")({
  beforeLoad: () => {
    if (!hasRole(["SuperAdmin", "ClientAdmin"])) {
      throw redirect({ to: "/errors/forbidden" })
    }
  },
  component: ClientDetailsPage,
})
