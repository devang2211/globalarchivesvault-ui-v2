import { createRoute, createRootRoute } from "@tanstack/react-router"
import { AuthLayout } from "../layouts/AuthLayout"
import SignInPage from "../../features/auth/pages/SignInPage"
import { Outlet } from "@tanstack/react-router"

export const rootRoute = createRootRoute({
  component: () => <div><Outlet /></div>,
})

export const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-in",
  component: () => (
    <AuthLayout>
      <SignInPage />
    </AuthLayout>
  ),
})