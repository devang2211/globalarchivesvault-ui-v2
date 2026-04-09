import { useNavigate } from "@tanstack/react-router"
import { getToken } from "@/shared/lib/auth"

export default function NotFoundPage() {
  const navigate = useNavigate()
  const isLoggedIn = !!getToken()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">

        {/* 404 */}
        <h1 className="text-7xl font-semibold tracking-tight">
          404
        </h1>

        {/* Title */}
        <p className="text-base font-medium">
          Oops! Page Not Found!
        </p>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          It seems like the page you're looking for
          <br />
          does not exist or might have been removed.
        </p>

        {/* ✅ ACTIONS (ONLY IF LOGGED IN) */}
        {isLoggedIn && (
          <div className="flex items-center justify-center gap-3 pt-2">

            <button
              onClick={() => window.history.back()}
              className="
                px-4 py-2 text-sm rounded-md border border-border
                bg-background hover:bg-muted transition cursor-pointer
              "
            >
              Go Back
            </button>

            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="
                px-4 py-2 text-sm rounded-md
                bg-primary text-primary-foreground
                hover:bg-primary/90 transition cursor-pointer
              "
            >
              Back to Dashboard
            </button>

          </div>
        )}

      </div>
    </div>
  )
}