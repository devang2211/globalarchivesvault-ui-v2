import { createFileRoute, redirect } from "@tanstack/react-router"
import { isSuperAdmin, isClientAdmin } from "@/shared/lib/auth"
import UserManagementPage from "@/features/user-management/pages/UserManagementPage"

export const Route = createFileRoute("/users/")({
  beforeLoad: () => {
    if (!isSuperAdmin() && !isClientAdmin()) {
      throw redirect({ to: "/errors/forbidden" })
    }
  },
  component: UserManagementPage,
})
