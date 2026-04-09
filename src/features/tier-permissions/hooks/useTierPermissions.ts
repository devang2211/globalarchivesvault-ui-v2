import { useEffect, useState } from "react"
import {
  getTiers,
  getPermissions,
  getTierPermissions,
  saveTierPermissions,
} from "../api/tier.api"
import { toast } from "sonner"

type TierPermissionsState = Record<
  string,
  {
    standard: string[]
    enterprise: string[]
  }
>

export const useTierPermissions = (features: any, createEmptyState: any) => {
  const [data, setData] = useState<TierPermissionsState>(createEmptyState())
  const [initial, setInitial] = useState("")
  const [loading, setLoading] = useState(false)

  const [tierIds, setTierIds] = useState<{ standard?: number; enterprise?: number }>({})
  const [permissionMap, setPermissionMap] = useState<Map<string, number>>(new Map())

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

        const newState = createEmptyState()

        features.forEach((section: any) => {
          section.items.forEach((feature: any) => {
            const codes = feature.permissions.map((p: any) => p.code)

            newState[feature.id].standard = codes.filter((c: string) =>
              stdCodes.includes(c)
            )
            newState[feature.id].enterprise = codes.filter((c: string) =>
              entCodes.includes(c)
            )
          })
        })

        setData(newState)
        setInitial(JSON.stringify(newState))
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
      const mapCodesToIds = (codes: string[]) =>
        codes.map(c => permissionMap.get(c)).filter(Boolean)

      const stdCodes = Object.values(data).flatMap((f: any) => f.standard)
      const entCodes = Object.values(data).flatMap((f: any) => f.enterprise)

      await Promise.all([
        saveTierPermissions(
          tierIds.standard,
          mapCodesToIds([...new Set(stdCodes)]) as number[]
        ),
        saveTierPermissions(
          tierIds.enterprise,
          mapCodesToIds([...new Set(entCodes)]) as number[]
        ),
      ])

      setInitial(JSON.stringify(data))

      toast.dismiss(toastId)
      toast.success("Permissions updated successfully")
    } catch (err) {
      toast.dismiss(toastId)
      toast.error("Failed to save changes")
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    setData,
    initial,
    loading,
    save,
  }
}