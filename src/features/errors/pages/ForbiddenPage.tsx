import { useNavigate } from "@tanstack/react-router"

export default function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="h-full flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">

        {/* Code */}
        <h1 className="text-7xl font-semibold tracking-tight">
          403
        </h1>

        {/* Title */}
        <p className="text-base font-medium">
          Access denied
        </p>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          You don’t have permission to access this page.
          If you believe this is a mistake, contact your administrator.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">

          <button
            onClick={() => window.history.back()}
                          className="
                px-4 py-2 text-sm rounded-md border border-border
                bg-background hover:bg-muted transition cursor-pointer
              "
          >
            Go back
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

      </div>
    </div>
  )
}