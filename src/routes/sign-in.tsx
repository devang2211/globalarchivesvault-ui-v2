import { createFileRoute, redirect } from "@tanstack/react-router"
import { getToken } from "@/shared/lib/auth"
import SignInPage from "@/features/auth/pages/SignInPage"

export const Route = createFileRoute("/sign-in")({
  beforeLoad: () => {
    const token = getToken()

    if (token) {
      throw redirect({
        to: "/dashboard",
      })
    }
  },
  component: SignInPage,
})