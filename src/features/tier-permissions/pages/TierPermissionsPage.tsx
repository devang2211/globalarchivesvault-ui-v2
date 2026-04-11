import { cn } from "@/lib/utils"
import { Check, RotateCcw, Save, X } from "lucide-react"

import { useTierPermissions } from "../hooks/useTierPermissions"
import permissionConfig from "@/shared/config/permissions"

/* ---------------------------------- */
/* TYPES */
/* ---------------------------------- */

type Tier = "standard" | "enterprise"

/* ---------------------------------- */
/* PERMISSIONS CONFIG */
/* ---------------------------------- */

const features = permissionConfig

/* ---------------------------------- */
/* STATE INIT */
/* ---------------------------------- */

const createEmptyState = () => {
  const state: Record<string, { standard: string[]; enterprise: string[] }> = {}

  features.forEach(section => {
    section.items.forEach(item => {
      state[item.id] = {
        standard: [],
        enterprise: [],
      }
    })
  })

  return state
}

/* ---------------------------------- */
/* PAGE */
/* ---------------------------------- */

export default function TierPermissionsPage() {
  const {
    data,
    setData,
    isDirty,
    loading,
    save,
    reset,
  } = useTierPermissions(features, createEmptyState)

  const toggle = (featureId: string, tier: Tier, perm: string) => {
    setData(prev => {
      const exists = prev[featureId][tier].includes(perm)

      return {
        ...prev,
        [featureId]: {
          ...prev[featureId],
          [tier]: exists
            ? prev[featureId][tier].filter(p => p !== perm)
            : [...prev[featureId][tier], perm],
        },
      }
    })
  }

  /* ---------------------------------- */
  /* UI */
  /* ---------------------------------- */

  return (
    <div className="h-full flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 w-1 self-stretch rounded-full bg-primary/70 shrink-0" />
          <div>
            <h1 className="text-lg font-semibold">Pricing Tier Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Configure access across Standard and Enterprise tiers
            </p>
          </div>
        </div>
        {isDirty && (
          <div className="self-stretch shrink-0 flex items-center gap-2 px-3 rounded-lg border border-border bg-muted/50">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-medium text-muted-foreground tracking-wide">
              Unsaved changes
            </span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {features.map(section => (
            <div
              key={section.section}
              className="rounded-xl border border-border/60 bg-background shadow-sm p-5 space-y-5"
            >
              {/* Section title */}
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span className="h-3 w-0.5 rounded-full bg-border" />
                {section.section}
              </div>

              {section.items.map(feature => (
                <div key={feature.id} className="space-y-2">

                  <div className="text-sm font-semibold text-foreground pl-0.5">
                    {feature.label}
                  </div>

                  {/* Table */}
                  <div className="rounded-lg border border-border/50 overflow-hidden divide-y divide-border/30">

                    {/* Header */}
                    <div className="grid grid-cols-[1fr_90px_90px] bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      <span>Permission</span>
                      <span className="text-center font-semibold">Standard</span>
                      <span className="text-center font-semibold">Enterprise</span>
                    </div>

                    {/* Rows */}
                    {feature.permissions.map(perm => {
                      const std = data[feature.id]?.standard ?? []
                      const ent = data[feature.id]?.enterprise ?? []

                      const isStd = std.includes(perm.code)
                      const isEnt = ent.includes(perm.code)

                      return (
                        <div
                          key={perm.code}
                          className="grid grid-cols-[1fr_90px_90px] items-center px-3 py-2.5 hover:bg-muted/40 transition"
                        >
                          <span className="text-sm text-foreground/80">
                            {perm.label}
                          </span>

                          <div className="flex justify-center">
                            <Toggle
                              active={isStd}
                              onClick={() => toggle(feature.id, "standard", perm.code)}
                            />
                          </div>

                          <div className="flex justify-center">
                            <Toggle
                              active={isEnt}
                              onClick={() => toggle(feature.id, "enterprise", perm.code)}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/40 pt-4 flex items-center justify-end gap-3">

        <button
          onClick={save}
          disabled={loading || !isDirty}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition cursor-pointer",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          <Save className="h-3.5 w-3.5" />
          Save Changes
        </button>

        <button
          onClick={reset}
          disabled={loading || !isDirty}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition cursor-pointer",
            "border border-border bg-background hover:bg-muted",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Cancel
        </button>

      </div>
    </div>
  )
}

/* ---------------------------------- */
/* TOGGLE */
/* ---------------------------------- */

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-6 w-6 flex items-center justify-center rounded-md",
        "border border-border/60 transition-all duration-150 cursor-pointer",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground hover:bg-muted"
      )}
    >
      {active ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  )
}
