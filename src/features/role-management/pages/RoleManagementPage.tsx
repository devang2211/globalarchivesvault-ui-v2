import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, ShieldCheck } from "lucide-react"
import { useRoles } from "../hooks/useRoles"
import { RoleDetailPanel } from "../components/RoleDetailPanel"

type PanelState =
  | { mode: "empty" }
  | { mode: "create" }
  | { mode: "edit"; roleId: number }

export default function RoleManagementPage() {
  const { data: roles = [], isLoading } = useRoles()
  const [panel, setPanel] = useState<PanelState>({ mode: "empty" })

  const handleSelectRole = (id: number) => {
    setPanel({ mode: "edit", roleId: id })
  }

  const handleNewRole = () => {
    setPanel({ mode: "create" })
  }

  const handleSaved = () => {
    setPanel({ mode: "empty" })
  }

  const handleCancel = () => {
    setPanel({ mode: "empty" })
  }

  return (
    <div className="h-full flex flex-col gap-0">

      {/* Page header */}
      <div className="flex items-start gap-3 mb-6">
        <span className="mt-0.5 w-1 self-stretch rounded-full bg-primary/70 shrink-0" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Role Management</h1>
          <p className="text-sm text-muted-foreground">
            Create and configure roles with granular permission assignments.
          </p>
        </div>
      </div>

      {/* Master-Detail layout */}
      <div className="flex-1 min-h-0 flex rounded-xl border border-border/60 overflow-hidden">

        {/* LEFT: Role list */}
        <div className="w-72 shrink-0 flex flex-col border-r border-border/60 bg-muted/20">

          {/* List header + New button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <span className="text-sm font-semibold text-foreground">Roles</span>
            <Button
              size="sm"
              onClick={handleNewRole}
              className="cursor-pointer h-7 gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              New Role
            </Button>
          </div>

          {/* Role list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                ))}
              </div>
            ) : roles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4 py-8">
                <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No roles yet.</p>
                <p className="text-xs text-muted-foreground">
                  Click "New Role" to create one.
                </p>
              </div>
            ) : (
              <ul className="p-2 space-y-0.5">
                {roles.map(role => {
                  const isSelected = panel.mode === "edit" && panel.roleId === role.id
                  return (
                    <li key={role.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectRole(role.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                          "hover:bg-muted/60",
                          isSelected && "bg-muted/80 ring-1 ring-border"
                        )}
                      >
                        {/* Active dot */}
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full shrink-0 mt-0.5",
                            role.isActive ? "bg-green-500" : "bg-muted-foreground/40"
                          )}
                        />
                        <span className="flex-1 text-sm font-medium truncate">
                          {role.name}
                        </span>
                        {!role.isActive && (
                          <Badge variant="outline" className="text-xs shrink-0 px-1.5 py-0 text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT: Detail panel */}
        <div className="flex-1 min-w-0 bg-background">
          {panel.mode === "empty" ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <ShieldCheck className="h-12 w-12 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-medium text-foreground/60">Select a role to edit</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Or click "New Role" to create one from scratch.
                </p>
              </div>
            </div>
          ) : (
            <RoleDetailPanel
              key={panel.mode === "create" ? "new" : `edit-${panel.roleId}`}
              roleId={panel.mode === "create" ? null : panel.roleId}
              onSaved={handleSaved}
              onCancel={handleCancel}
            />
          )}
        </div>

      </div>
    </div>
  )
}
