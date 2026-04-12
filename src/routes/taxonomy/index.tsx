import { createFileRoute, redirect } from "@tanstack/react-router"
import { isSuperAdmin } from "@/shared/lib/auth"
import TaxonomyPage from "@/features/taxonomy/pages/TaxonomyPage"

export const Route = createFileRoute("/taxonomy/")({
  beforeLoad: () => {
    if (!isSuperAdmin()) {
      throw redirect({ to: "/errors/forbidden" })
    }
  },
  component: TaxonomyPage,
})
