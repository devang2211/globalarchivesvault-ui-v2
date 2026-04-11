import { useEffect, useRef, useState } from "react"
import {
  getTiers,
  getTierPermissions,
  saveTierPermissions,
  type TierPermissionDto,
} from "../api/tier.api"
import { toast } from "sonner"
import type { FeatureSection } from "@/shared/config/permissions"

type TierPermissionsState = Record<
  string,
  {
    standard: string[]
    enterprise: string[]
  }
>

type VersionMap = {
  standard: Record<string, number>
  enterprise: Record<string, number>
}

type CreateEmptyState = () => TierPermissionsState

const DEFAULT_VERSION = 1

const isConflictError = (err: unknown): boolean => {
  if (err && typeof err === "object") {
    const axiosErr = err as { response?: { status?: number } }
    return axiosErr.response?.status === 409
  }
  return false
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === "object") {
    const axiosErr = err as { message?: string }
    return axiosErr.message || fallback
  }
  return fallback
}

// Sort arrays before comparing so toggle-off → toggle-on doesn't produce a false dirty signal
const sortedStateJson = (state: TierPermissionsState): string =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(state).map(([k, v]) => [
        k,
        {
          standard: [...v.standard].sort(),
          enterprise: [...v.enterprise].sort(),
        },
      ])
    )
  )

const createEmptyVersionMap = (): VersionMap => ({ standard: {}, enterprise: {} })

export const useTierPermissions = (
  features: FeatureSection[],
  createEmptyState: CreateEmptyState
) => {
  const [data, setData] = useState<TierPermissionsState>(createEmptyState)
  const [initial, setInitial] = useState<TierPermissionsState | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [tierIds, setTierIds] = useState<{ standard?: number; enterprise?: number }>({})
  const [versions, setVersions] = useState<VersionMap>(createEmptyVersionMap)
  const [initialVersions, setInitialVersions] = useState<VersionMap>(createEmptyVersionMap)

  // Stable refs so the effect doesn't need to re-run when the caller re-renders
  const featuresRef = useRef(features)
  const createEmptyStateRef = useRef(createEmptyState)

  const loadPermissions = async (standardId: number, enterpriseId: number) => {
    const [stdItems, entItems] = await Promise.all([
      getTierPermissions(standardId),
      getTierPermissions(enterpriseId),
    ])

    const newState = createEmptyStateRef.current()
    const newVersions: VersionMap = { standard: {}, enterprise: {} }

    const applyItems = (items: TierPermissionDto[], tier: "standard" | "enterprise") => {
      items.forEach(({ permissionCode, isAllowed, version }) => {
        newVersions[tier][permissionCode] = version
        if (isAllowed) {
          featuresRef.current.forEach(section => {
            section.items.forEach(feature => {
              if (feature.permissions.some(p => p.code === permissionCode)) {
                if (!newState[feature.id][tier].includes(permissionCode)) {
                  newState[feature.id][tier].push(permissionCode)
                }
              }
            })
          })
        }
      })
    }

    applyItems(stdItems, "standard")
    applyItems(entItems, "enterprise")

    setData(newState)
    setInitial(newState)
    setVersions(newVersions)
    setInitialVersions(newVersions)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const tiers = await getTiers()

        const standard = tiers.find(t => t.name.toLowerCase().includes("standard"))
        const enterprise = tiers.find(t => t.name.toLowerCase().includes("enterprise"))

        if (!standard || !enterprise) {
          toast.error("Could not find Standard or Enterprise tier. Please check your configuration.")
          return
        }

        setTierIds({ standard: standard.id, enterprise: enterprise.id })
        await loadPermissions(standard.id, enterprise.id)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load tier permissions")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const buildPermissionList = (tier: "standard" | "enterprise", versionMap: VersionMap): TierPermissionDto[] => {
    const selectedCodes = new Set(Object.values(data).flatMap(f => f[tier]))
    const items: TierPermissionDto[] = []

    featuresRef.current.forEach(section => {
      section.items.forEach(feature => {
        feature.permissions.forEach(perm => {
          items.push({
            permissionCode: perm.code,
            isAllowed: selectedCodes.has(perm.code),
            version: versionMap[tier][perm.code] ?? DEFAULT_VERSION,
          })
        })
      })
    })

    return items
  }

  const save = async () => {
    if (!tierIds.standard || !tierIds.enterprise) return

    const toastId = toast.loading("Saving changes...")
    setSaving(true)
    setLoading(true)

    try {
      const [stdResult, entResult] = await Promise.allSettled([
        saveTierPermissions(tierIds.standard, buildPermissionList("standard", versions)),
        saveTierPermissions(tierIds.enterprise, buildPermissionList("enterprise", versions)),
      ])

      toast.dismiss(toastId)

      const stdFailed = stdResult.status === "rejected"
      const entFailed = entResult.status === "rejected"

      if (stdFailed || entFailed) {
        const stdConflict = stdFailed && isConflictError(stdResult.reason)
        const entConflict = entFailed && isConflictError((entResult as PromiseRejectedResult).reason)
        const conflictReason = stdConflict
          ? stdResult.reason
          : entConflict
            ? (entResult as PromiseRejectedResult).reason
            : null

        if (conflictReason) {
          toast.error(getErrorMessage(conflictReason, "Concurrent modification detected. Please refresh and retry."), {
            action: { label: "Refresh", onClick: () => window.location.reload() },
          })
        } else if (stdFailed && entFailed) {
          toast.error("Failed to save changes for both tiers")
        } else if (stdFailed) {
          toast.error("Failed to save Standard tier — Enterprise was saved successfully")
        } else {
          toast.error("Failed to save Enterprise tier — Standard was saved successfully")
        }
      } else {
        toast.success("Permissions updated successfully")
        await loadPermissions(tierIds.standard, tierIds.enterprise)
      }
    } catch (err) {
      toast.dismiss(toastId)
      toast.error("Failed to save changes")
    } finally {
      setSaving(false)
      setLoading(false)
    }
  }

  const reset = () => {
    if (initial !== null) {
      setData(initial)
      setVersions(initialVersions)
    }
  }

  const isDirty = initial !== null && sortedStateJson(data) !== sortedStateJson(initial)

  return {
    data,
    setData,
    isDirty,
    loading,
    saving,
    save,
    reset,
  }
}
