import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import permissionConfig from "@/shared/config/permissions"
import { getTierPermissions } from "@/features/tier-permissions/api/tier.api"

type Props = {
  selectedTierId?: number
}

type State = Record<string, string[]>

export const PlatformAccessSection = ({ selectedTierId }: Props) => {
  const [data, setData] = useState<State>({})

  /* =========================================
     INIT EMPTY STATE
  ========================================= */
  useEffect(() => {
    const initial: State = {}

    permissionConfig.forEach((section) => {
      section.items.forEach((f) => {
        initial[f.id] = []
      })
    })

    setData(initial)
  }, [])

  /* =========================================
     LOAD FROM TIER
  ========================================= */
  useEffect(() => {
    if (!selectedTierId) return

    const load = async () => {
      try {
        const permissionIds = await getTierPermissions(selectedTierId)

        // TODO: map ids → codes (reuse your permissionMap logic)

        // TEMP (until mapping wired)
        console.log(permissionIds)
      } catch (e) {
        console.error(e)
      }
    }

    load()
  }, [selectedTierId])

  /* =========================================
     TOGGLE
  ========================================= */
  const toggle = (featureId: string, code: string) => {
    setData((prev) => {
      const exists = prev[featureId]?.includes(code)

      return {
        ...prev,
        [featureId]: exists
          ? prev[featureId].filter((p) => p !== code)
          : [...(prev[featureId] || []), code],
      }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5 space-y-4">

      {/* HEADER */}
      <div>
        <h3 className="text-base font-semibold">
          Platform Access Setup
        </h3>
        <p className="text-sm text-muted-foreground">
          Customize permissions for this client
        </p>
      </div>

      {/* TABLE */}
      <div className="border border-border rounded-lg overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-[1.5fr_2fr] text-sm font-medium bg-muted/40 border-b border-border">
          <div className="px-4 py-2">Feature</div>
          <div className="px-4 py-2">Permissions</div>
        </div>

        {/* BODY */}
        {permissionConfig.map((section) => (
          <div key={section.section}>

            {/* SECTION */}
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/20">
              {section.section}
            </div>

            {section.items.map((feature) => (
              <div
                key={feature.id}
                className="grid grid-cols-[1.5fr_2fr] border-t border-border"
              >
                {/* FEATURE */}
                <div className="px-4 py-3 text-sm">
                  {feature.label}
                </div>

                {/* PERMISSIONS */}
                <div className="px-4 py-2 flex flex-wrap gap-2">
                  {feature.permissions.map((perm) => {
                    const active =
                      data[feature.id]?.includes(perm.code)

                    return (
                      <button
                        key={perm.code}
                        onClick={() =>
                          toggle(feature.id, perm.code)
                        }
                        className={cn(
                          "px-2 py-1 text-xs rounded-md border transition cursor-pointer",
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted"
                        )}
                      >
                        {perm.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}