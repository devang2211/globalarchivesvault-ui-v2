import { createRootRoute, Outlet, redirect } from "@tanstack/react-router"
import { ProgressProvider } from "@/app/providers/ProgressProvider"
import NotFoundPage from "@/features/errors/pages/NotFoundPage"
import { getToken } from "@/shared/lib/auth"

function RootLayout() {
  return (
    <ProgressProvider>
      <Outlet />
    </ProgressProvider>
  )
}

const publicRoutes = ["/sign-in"]

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,

  beforeLoad: ({ location }) => {
    const token = getToken() // ✅ CHECK AUTH TOKEN

    const isPublicRoute = publicRoutes.includes(location.pathname)

    if (!token && !isPublicRoute) {
      throw redirect({ to: "/sign-in" }) // ✅ GLOBAL GUARD
    }
  },
})