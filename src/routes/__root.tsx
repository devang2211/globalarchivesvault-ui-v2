import { createRootRoute, Outlet, redirect } from "@tanstack/react-router"
import { ProgressProvider } from "@/app/providers/ProgressProvider"
import NotFoundPage from "@/features/errors/pages/NotFoundPage"
import { isTokenValid } from "@/shared/lib/auth"

function RootLayout() {
  return (
    <ProgressProvider>
      <Outlet />
    </ProgressProvider>
  )
}

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-7xl font-semibold tracking-tight">500</h1>
        <p className="text-base font-medium">Something went wrong</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.replace("/")}
            className="px-4 py-2 text-sm rounded-md border border-border bg-background hover:bg-muted transition cursor-pointer"
          >
            Dashboard
          </button>          
        </div>
      </div>
    </div>
  )
}

const publicRoutes = ["/sign-in"]

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: RootErrorComponent,

  beforeLoad: ({ location }) => {
    const isPublicRoute = publicRoutes.includes(location.pathname)

    if (!isTokenValid() && !isPublicRoute) {
      throw redirect({ to: "/sign-in" })
    }
  },
})