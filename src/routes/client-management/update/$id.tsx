import { createFileRoute, redirect } from "@tanstack/react-router"
import { ClientOnboardingPage } from "@/features/client-management/pages/ClientOnboardingPage"
import { isSuperAdmin } from "@/shared/lib/auth"

export const Route = createFileRoute("/client-management/update/$id")({
  beforeLoad: () => {
    if (!isSuperAdmin()) {
      throw redirect({ to: "/errors/forbidden" })
    }
  },
  component: ClientOnboardingPage,
})
