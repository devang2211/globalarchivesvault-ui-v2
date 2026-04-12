import { createFileRoute, redirect } from "@tanstack/react-router"
import { isSuperAdmin } from "@/shared/lib/auth"
import RoleManagementPage from "@/features/role-management/pages/RoleManagementPage"

export const Route = createFileRoute("/roles/")({
  beforeLoad: () => {
    if (!isSuperAdmin()) {
      throw redirect({ to: "/errors/forbidden" })
    }
  },
  component: RoleManagementPage,
})
