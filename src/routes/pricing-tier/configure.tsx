import { createFileRoute, redirect } from "@tanstack/react-router"
import TierPermissionsPage from "@/features/tier-permissions/pages/TierPermissionsPage"
import { isSuperAdmin } from "@/shared/lib/auth"

export const Route = createFileRoute("/pricing-tier/configure")({
  component: TierPermissionsPage,

  beforeLoad: () => {
    if (!isSuperAdmin()) {
      throw redirect({ to: "/errors/forbidden" })
    }
  }
})