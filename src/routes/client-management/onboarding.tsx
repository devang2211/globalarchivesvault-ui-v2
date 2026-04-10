import { createFileRoute, redirect } from "@tanstack/react-router"
import { ClientCreatePage } from "@/features/client-management/pages/ClientCreatePage"
import { getToken } from "@/shared/lib/auth"

export const Route = createFileRoute("/client-management/onboarding")({
  beforeLoad: () => {
    const token = getToken()

    if (!token) {
      throw redirect({ to: "/sign-in" })
    }
  },
  component: ClientCreatePage,
})