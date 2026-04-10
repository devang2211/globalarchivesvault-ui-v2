import { useEffect, useRef, useState } from "react"
import {
  getTiers,
  getPermissions,
  getTierPermissions,
  saveTierPermissions,
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

type CreateEmptyState = () => TierPermissionsState

export const useTierPermissions = (
  features: FeatureSection[],
  createEmptyState: CreateEmptyState
) => {
  const [data, setData] = useState<TierPermissionsState>(createEmptyState)
  const [initial, setInitial] = useState<TierPermissionsState | null>(null)
  const [loading, setLoading] = useState(false)

  const [tierIds, setTierIds] = useState<{ standard?: number; enterprise?: number }>({})
  const [permissionMap, setPermissionMap] = useState<Map<string, number>>(new Map())

  // Stable refs so the effect doesn't need to re-run when the caller re-renders
  const featuresRef = useRef(features)
  const createEmptyStateRef = useRef(createEmptyState)

  useEffect(() => {
    const load = async () => {
      try {
        const tiers = await getTiers()

        const standard = tiers.find(t => t.name.toLowerCase().includes("standard"))
        const enterprise = tiers.find(t => t.name.toLowerCase().includes("enterprise"))

        if (!standard || !enterprise) return

        setTierIds({
          standard: standard.id,
          enterprise: enterprise.id,
        })

        const permissions = await getPermissions()

        const map = new Map<string, number>()
        permissions.forEach(p => map.set(p.code, p.id))
        setPermissionMap(map)

        const [stdIds, entIds] = await Promise.all([
          getTierPermissions(standard.id),
          getTierPermissions(enterprise.id),
        ])

        const getCodes = (ids: number[]) =>
          permissions
            .filter(p => ids.includes(p.id))
            .map(p => p.code)

        const stdCodes = getCodes(stdIds)
        const entCodes = getCodes(entIds)

        const newState = createEmptyStateRef.current()

        featuresRef.current.forEach(section => {
          section.items.forEach(feature => {
            const codes = feature.permissions.map(p => p.code)

            newState[feature.id].standard = codes.filter(c => stdCodes.includes(c))
            newState[feature.id].enterprise = codes.filter(c => entCodes.includes(c))
          })
        })

        setData(newState)
        setInitial(newState)
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [])

  const save = async () => {
    if (!tierIds.standard || !tierIds.enterprise) return

    const toastId = toast.loading("Saving changes...")
    setLoading(true)

    try {
      const mapCodesToIds = (codes: string[]): number[] =>
        codes
          .map(c => permissionMap.get(c))
          .filter((id): id is number => id !== undefined)

      const stdCodes = Object.values(data).flatMap(f => f.standard)
      const entCodes = Object.values(data).flatMap(f => f.enterprise)

      await Promise.all([
        saveTierPermissions(tierIds.standard, mapCodesToIds([...new Set(stdCodes)])),
        saveTierPermissions(tierIds.enterprise, mapCodesToIds([...new Set(entCodes)])),
      ])

      setInitial(data)

      toast.dismiss(toastId)
      toast.success("Permissions updated successfully")
    } catch (err) {
      toast.dismiss(toastId)
      toast.error("Failed to save changes")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    if (initial !== null) {
      setData(initial)
    }
  }

  const isDirty = initial !== null && JSON.stringify(data) !== JSON.stringify(initial)

  return {
    data,
    setData,
    isDirty,
    loading,
    save,
    reset,
  }
}
