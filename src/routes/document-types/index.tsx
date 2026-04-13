import { createFileRoute, redirect } from "@tanstack/react-router"
import { isSuperAdmin, isClientAdmin } from "@/shared/lib/auth"
import DocumentTypePage from "@/features/document-type/pages/DocumentTypePage"

export const Route = createFileRoute("/document-types/")({
  beforeLoad: () => {
    if (!isSuperAdmin() && !isClientAdmin()) {
      throw redirect({ to: "/errors/forbidden" })
    }
  },
  component: DocumentTypePage,
})
