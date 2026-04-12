import { Fragment } from "react"
import { useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import permissionConfig from "@/shared/config/permissions"
import type { UserForm } from "../schema/user.schema"

type Props = {
  readonly?: boolean
}

export function UserPermissionsMatrix({ readonly }: Props) {
  const form = useFormContext<UserForm>()
  const permissions = form.watch("permissions")

  const isAllowed = (code: string) => {
    return permissions.find(p => p.permissionCode === code)?.isAllowed ?? false
  }

  const toggle = (code: string) => {
    const current = permissions.find(p => p.permissionCode === code)
    if (current) {
      const updated = permissions.map(p =>
        p.permissionCode === code ? { ...p, isAllowed: !p.isAllowed } : p
      )
      form.setValue("permissions", updated)
    } else {
      form.setValue("permissions", [...permissions, { permissionCode: code, isAllowed: true }])
    }
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 grid grid-cols-[1fr_80px] bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Permission
        </span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
          Allowed
        </span>
      </div>

      {/* Body */}
      <div className="divide-y divide-border/30">
        {permissionConfig.map(section => (
          <Fragment key={section.section}>
            {/* Section header — L0 */}
            <div className="grid grid-cols-[1fr_80px] bg-muted/70 px-4 py-2.5 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="h-4 w-0.5 rounded-full bg-primary/60" />
                <span className="text-base font-medium text-foreground">{section.section}</span>
              </div>
            </div>

            {section.items.map(feature => (
              <Fragment key={feature.id}>
                {/* Feature row — L1 */}
                <div className="grid grid-cols-[1fr_80px] bg-muted/35 px-4 py-2">
                  <div className="flex items-center pl-5">
                    <span className="text-sm font-normal text-foreground/70">{feature.label}</span>
                  </div>
                </div>

                {/* Permission rows — L2 */}
                {feature.permissions.map(perm => (
                  <div
                    key={perm.code}
                    className={cn(
                      "group relative grid grid-cols-[1fr_80px] items-center px-4 py-2 transition-colors",
                      !readonly && "hover:bg-muted/50"
                    )}
                  >
                    {!readonly && (
                      <span className="absolute left-0 inset-y-0 w-0.5 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center rounded-r-full" />
                    )}
                    <span className="text-sm text-foreground/80 pl-10">{perm.label}</span>
                    <div className="flex justify-center">
                      <Switch
                        checked={isAllowed(perm.code)}
                        disabled={readonly}
                        onCheckedChange={() => toggle(perm.code)}
                        className={cn(!readonly && "cursor-pointer")}
                      />
                    </div>
                  </div>
                ))}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
