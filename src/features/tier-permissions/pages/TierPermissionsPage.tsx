import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RotateCcw, Save } from "lucide-react"
import { Fragment, useState } from "react"
import { toast } from "sonner"

import { useTierPermissions } from "../hooks/useTierPermissions"
import permissionConfig from "@/shared/config/permissions"

/* ---------------------------------- */
/* TYPES */
/* ---------------------------------- */

type Tier = "standard" | "enterprise"

/* ---------------------------------- */
/* STATE INIT */
/* ---------------------------------- */

const features = permissionConfig

const createEmptyState = () => {
  const state: Record<string, { standard: string[]; enterprise: string[] }> = {}
  features.forEach(section => {
    section.items.forEach(item => {
      state[item.id] = { standard: [], enterprise: [] }
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
    saving,
    save,
    reset,
  } = useTierPermissions(features, createEmptyState)

  const [showDiscard, setShowDiscard] = useState(false)

  const handleSave = () => {
    if (!isDirty) {
      toast.info("Nothing to save")
      return
    }
    save()
  }

  const handleDiscard = () => {
    if (isDirty) {
      setShowDiscard(true)
    } else {
      reset()
    }
  }

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
    <>
      <div className="h-full flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 w-1 self-stretch rounded-full bg-primary/70 shrink-0" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Pricing Tier Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Configure access across Standard and Enterprise tiers
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="rounded-xl border border-border/60 overflow-hidden">

            {/* Sticky column header */}
            <div className="sticky top-0 z-10 grid grid-cols-[1fr_110px_110px] bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Permission</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Standard</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Enterprise</span>
            </div>

            {/* Body */}
            <div className={cn("divide-y divide-border/30", saving && "opacity-60 pointer-events-none")}>
              {features.map(section => (
                <Fragment key={section.section}>

                  {/* Section row */}
                  <div className="grid grid-cols-[1fr_110px_110px] bg-muted/60 px-4 py-2.5 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-0.5 rounded-full bg-primary/60" />
                      <span className="text-base font-medium text-foreground">
                        {section.section}
                      </span>
                    </div>
                  </div>

                  {section.items.map((feature, featureIdx) => {
                    const isLastFeature = featureIdx === section.items.length - 1

                    return (
                      <Fragment key={feature.id}>

                        {/* Feature row */}
                        <div className="relative grid grid-cols-[1fr_110px_110px] bg-muted/20 px-4 py-2">
                          <span className="absolute left-[17px] top-0 h-1/2 w-px bg-foreground/20" />
                          {!isLastFeature && (
                            <span className="absolute left-[17px] top-1/2 h-1/2 w-px bg-foreground/20" />
                          )}
                          <span className="absolute left-[17px] top-1/2 h-px w-3 bg-foreground/20" />
                          <div className="flex items-center pl-8">
                            <span className="text-sm font-normal text-foreground/70">
                              {feature.label}
                            </span>
                          </div>
                        </div>

                        {/* Permission rows */}
                        {feature.permissions.map((perm, permIdx) => {
                          const isLastPerm = permIdx === feature.permissions.length - 1
                          const isStd = data[feature.id]?.standard.includes(perm.code) ?? false
                          const isEnt = data[feature.id]?.enterprise.includes(perm.code) ?? false

                          return (
                            <div
                              key={perm.code}
                              className="group relative grid grid-cols-[1fr_110px_110px] items-center px-4 py-2 hover:bg-muted/50 transition-colors"
                            >
                              <span className="absolute left-0 inset-y-0 w-0.5 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center rounded-r-full" />

                              {!isLastFeature && (
                                <span className="absolute left-[17px] inset-y-0 w-px bg-foreground/15" />
                              )}
                              <span className="absolute left-[29px] top-0 h-1/2 w-px bg-foreground/15" />
                              {!isLastPerm && (
                                <span className="absolute left-[29px] top-1/2 h-1/2 w-px bg-foreground/15" />
                              )}
                              <span className="absolute left-[29px] top-1/2 h-px w-3 bg-foreground/15" />

                              <span className="text-sm text-foreground/80 pl-11">
                                {perm.label}
                              </span>

                              <div className="flex justify-center">
                                <Switch
                                  checked={isStd}
                                  disabled={loading}
                                  onCheckedChange={() => toggle(feature.id, "standard", perm.code)}
                                  className="cursor-pointer"
                                />
                              </div>

                              <div className="flex justify-center">
                                <Switch
                                  checked={isEnt}
                                  disabled={loading}
                                  onCheckedChange={() => toggle(feature.id, "enterprise", perm.code)}
                                  className="cursor-pointer"
                                />
                              </div>
                            </div>
                          )
                        })}

                      </Fragment>
                    )
                  })}

                </Fragment>
              ))}
            </div>

          </div>
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 border-t border-border/60 pt-4 flex items-center justify-between gap-3">
          {isDirty ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-medium text-muted-foreground tracking-wide">
                Unsaved changes
              </span>
            </div>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={loading}
              className={cn("cursor-pointer", loading && "opacity-70 pointer-events-none")}
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={loading}
              className={cn("cursor-pointer", loading && "opacity-70 pointer-events-none")}
            >
              <RotateCcw className="h-4 w-4" />
              Discard Changes
            </Button>
          </div>
        </div>

      </div>

      {/* Discard confirmation */}
      <AlertDialog open={showDiscard} onOpenChange={setShowDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              All unsaved changes will be reverted to the last saved state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="cursor-pointer">
              Keep editing
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => { reset(); setShowDiscard(false) }}
              className="cursor-pointer"
            >
              Discard
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
