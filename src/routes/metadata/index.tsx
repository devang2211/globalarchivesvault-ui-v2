import { createFileRoute, redirect } from "@tanstack/react-router"
import { isSuperAdmin } from "@/shared/lib/auth"
import MetadataPage from "@/features/metadata/pages/MetadataPage"

export const Route = createFileRoute("/metadata/")({
  beforeLoad: () => {
    if (!isSuperAdmin()) {
      throw redirect({ to: "/errors/forbidden" })
    }
  },
  component: MetadataPage,
})
