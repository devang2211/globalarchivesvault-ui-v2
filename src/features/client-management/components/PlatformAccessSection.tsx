import { useEffect, useState, Fragment } from "react"
import { useFormContext } from "react-hook-form"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

import { Switch } from "@/components/ui/switch"
import permissionConfig from "@/shared/config/permissions"
import { getTierPermissions } from "@/features/tier-permissions/api/tier.api"
import type { ClientDetailsForm } from "../schema/onboarding.schema"

const COLS = "grid-cols-[1fr_130px_140px_130px]"

export const PlatformAccessSection = ({ tierName }: { tierName?: string }) => {
  const form = useFormContext<ClientDetailsForm>()
  const tierId = form.watch("tierId")

  const [tierMap, setTierMap] = useState<Map<string, boolean>>(new Map())
  const [clientMap, setClientMap] = useState<Map<string, boolean>>(new Map())
  const [loading, setLoading] = useState(false)

  /* -------------------------------------------------------
     Load tier permissions — reset both maps on tier change
  ------------------------------------------------------- */
  useEffect(() => {
    if (!tierId) {
      setTierMap(new Map())
      setClientMap(new Map())
      return
    }

    const load = async () => {
      setLoading(true)
      try {
        const items = await getTierPermissions(tierId)
        const map = new Map<string, boolean>()
        items.forEach(({ permissionCode, isAllowed }) => {
          map.set(permissionCode, isAllowed)
        })
        setTierMap(map)
        setClientMap(new Map(map)) // initialize client from tier
      } catch {
        setTierMap(new Map())
        setClientMap(new Map())
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [tierId])

  /* -------------------------------------------------------
     Toggle client access
  ------------------------------------------------------- */
  const toggleClient = (code: string) => {
    setClientMap((prev) => {
      const next = new Map(prev)
      next.set(code, !prev.get(code))
      return next
    })
  }

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */
  return (
    <div className={cn("rounded-xl border border-border/60 overflow-hidden", loading && "opacity-60 pointer-events-none")}>

      {/* COLUMN HEADERS */}
      <div className={cn("sticky top-0 z-10 grid bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3", COLS)}>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Permission
        </span>
        <div className="text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Default Access</p>
          <p className="text-[10px] text-muted-foreground/60 normal-case tracking-normal mt-0.5">
            {tierName ?? "Pricing Tier"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client Access</p>
          <p className="text-[10px] text-muted-foreground/60 normal-case tracking-normal mt-0.5">Override</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Effective Access</p>
        </div>
      </div>

      {/* BODY */}
      <div className="divide-y divide-border/30">
        {permissionConfig.map((section) => (
          <Fragment key={section.section}>

            {/* L0 — SECTION */}
            <div className={cn("grid bg-muted/70 px-4 py-2.5 border-b border-border/40", COLS)}>
              <div className="flex items-center gap-2">
                <span className="h-4 w-0.5 rounded-full bg-primary/60" />
                <span className="text-base font-medium text-foreground">{section.section}</span>
              </div>
            </div>

            {section.items.map((feature) => (
              <Fragment key={feature.id}>

                {/* L1 — FEATURE */}
                <div className={cn("grid bg-muted/35 px-4 py-2", COLS)}>
                  <span className="text-sm font-normal text-foreground/70 pl-5">{feature.label}</span>
                </div>

                {/* L2 — PERMISSION ROWS */}
                {feature.permissions.map((perm) => {
                  const tierAllowed = tierMap.get(perm.code) ?? false
                  const clientAllowed = clientMap.get(perm.code) ?? false
                  // Effective mirrors client state exactly
                  const effectiveAllowed = clientAllowed
                  const isOverridden = tierId && clientAllowed !== tierAllowed

                  return (
                    <div
                      key={perm.code}
                      className={cn("group relative grid items-center px-4 py-2 hover:bg-muted/50 transition-colors", COLS)}
                    >
                      <span className="absolute left-0 inset-y-0 w-0.5 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center rounded-r-full" />

                      <div className="flex items-center gap-2 pl-10">
                        <span className="text-sm text-foreground/80">{perm.label}</span>
                        {isOverridden && (
                          <span className="inline-flex items-center rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400">
                            overridden
                          </span>
                        )}
                      </div>

                      {/* DEFAULT ACCESS — readonly */}
                      <div className="flex justify-center">
                        {!tierId ? (
                          <span className="text-xs text-muted-foreground/30">—</span>
                        ) : tierAllowed ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground/30" />
                        )}
                      </div>

                      {/* CLIENT ACCESS — toggleable */}
                      <div className="flex justify-center">
                        {!tierId ? (
                          <span className="text-xs text-muted-foreground/30">—</span>
                        ) : (
                          <Switch
                            checked={clientAllowed}
                            onCheckedChange={() => toggleClient(perm.code)}
                            className="cursor-pointer"
                          />
                        )}
                      </div>

                      {/* Override ACCESS — readonly, mirrors client */}
                      <div className="flex justify-center">
                        {!tierId ? (
                          <span className="text-xs text-muted-foreground/30">—</span>
                        ) : effectiveAllowed ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground/30" />
                        )}
                      </div>
                    </div>
                  )
                })}

              </Fragment>
            ))}

          </Fragment>
        ))}
      </div>

    </div>
  )
}
