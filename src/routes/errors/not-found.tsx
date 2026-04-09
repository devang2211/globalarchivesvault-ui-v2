import { createFileRoute } from "@tanstack/react-router"
import NotFoundPage from "@/features/errors/pages/NotFoundPage"

export const Route = createFileRoute("/errors/not-found")({
  component: NotFoundPage,
})