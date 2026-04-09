import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Check, X, Loader2 } from "lucide-react"

import { useTierPermissions } from "../hooks/useTierPermissions"

/* ---------------------------------- */
/* TYPES */
/* ---------------------------------- */

type Tier = "standard" | "enterprise"

/* ---------------------------------- */
/* PERMISSIONS CONFIG (STATIC) */
/* ---------------------------------- */

const features = [
  {
    section: "Administration",
    items: [
      {
        id: "user-management",
        label: "User Management",
        permissions: [
          { label: "View", code: "USER_VIEW" },
          { label: "Modify Platform Access", code: "USER_MODIFY_PLATFORM_PERMISSION_ACCESS" },
          { label: "Modify Record Access", code: "USER_MODIFY_RECORD_TYPE_ACCESS" },
          { label: "Save", code: "USER_SAVE" },
        ],
      },
    ],
  },
  {
    section: "Records Setup",
    items: [
      {
        id: "record-type",
        label: "Document Types",
        permissions: [
          { label: "View", code: "RECORD_TYPE_CONFIG_VIEW" },
          { label: "Save", code: "RECORD_TYPE_CONFIG_SAVE" },
        ],
      },
    ],
  },
  {
    section: "Records",
    items: [
      {
        id: "record-upload",
        label: "Upload",
        permissions: [
          { label: "View", code: "RECORD_UPLOAD_VIEW" },
          { label: "Save", code: "RECORD_UPLOAD_SAVE" },
        ],
      },
    ],
  },
]

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
    initial,
    loading,
    save,
  } = useTierPermissions(features, createEmptyState)

  const isDirty = useMemo(
    () => JSON.stringify(data) !== initial,
    [data, initial]
  )

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
      <div>
        <h1 className="text-lg font-semibold">Tier Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Configure access across Standard and Enterprise tiers
        </p>
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
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.section}
              </div>

              {section.items.map(feature => (
                <div key={feature.id} className="space-y-3">

                  <div className="text-sm font-semibold">
                    {feature.label}
                  </div>

                  {/* Table */}
                  <div className="rounded-lg border border-border/50 overflow-hidden">

                    {/* Header */}
                    <div className="grid grid-cols-[1fr_90px_90px] bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      <span>Permission</span>
                      <span className="text-center font-medium">Standard</span>
                      <span className="text-center font-medium">Enterprise</span>
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
                          className="grid grid-cols-[1fr_90px_90px] items-center px-3 py-2 hover:bg-muted/40 transition"
                        >
                          <span className="text-sm font-medium">
                            {perm.label}
                          </span>

                          <div className="flex justify-center">
                            <Toggle
                              active={isStd}
                              onClick={() =>
                                toggle(feature.id, "standard", perm.code)
                              }
                            />
                          </div>

                          <div className="flex justify-center">
                            <Toggle
                              active={isEnt}
                              onClick={() =>
                                toggle(feature.id, "enterprise", perm.code)
                              }
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
      <div className="border-t border-border/40 pt-4 flex flex-col items-center gap-3">

        <div className="flex items-center gap-3">

<button
  onClick={save}
  disabled={!isDirty || loading}
className={cn(
  "px-6 py-2 rounded-md text-sm font-medium transition cursor-pointer",
  "disabled:cursor-not-allowed disabled:opacity-60",
  isDirty
    ? "bg-primary text-primary-foreground hover:bg-primary/90"
    : "bg-muted text-muted-foreground"
)}
>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
  Save Changes
</button>

<button
  onClick={() => setData(JSON.parse(initial))}
  disabled={!isDirty || loading}
  className={cn(
    "px-5 py-2 rounded-md text-sm transition cursor-pointer",
    "border border-border text-muted-foreground",
    "hover:bg-muted hover:text-foreground",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  )}
>
  Cancel
</button>

        </div>

        {isDirty && (
          <span className="text-xs text-muted-foreground">
            You have unsaved changes
          </span>
        )}
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
        "h-8 w-8 flex items-center justify-center rounded-md transition-all cursor-pointer",
        active
          ? "bg-primary text-white"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      {active ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4 opacity-40" />
      )}
    </button>
  )
}