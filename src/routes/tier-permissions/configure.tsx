import { createFileRoute } from "@tanstack/react-router"
import TierPermissionsPage from "@/features/tier-permissions/pages/TierPermissionsPage"

export const Route = createFileRoute("/tier-permissions/configure")({
  component: TierPermissionsPage,
})