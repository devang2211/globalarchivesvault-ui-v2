import { createFileRoute } from "@tanstack/react-router"
import ForbiddenPage from "@/features/errors/pages/ForbiddenPage"

export const Route = createFileRoute("/errors/forbidden")({
  component: ForbiddenPage,
})