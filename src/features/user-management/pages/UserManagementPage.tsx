import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Users } from "lucide-react"
import { isSuperAdmin } from "@/shared/lib/auth"
import { useClientContext } from "@/shared/hooks/useClientContext"
import { useUsers } from "../hooks/useUsers"
import { UserDetailPanel } from "../components/UserDetailPanel"

type PanelState =
  | { mode: "empty" }
  | { mode: "create" }
  | { mode: "edit"; userId: number }

export default function UserManagementPage() {
  const [panel, setPanel] = useState<PanelState>({ mode: "empty" })

  const { selectedClient, clients } = useClientContext({ visible: isSuperAdmin() })
  const clientId = selectedClient?.id ?? null

  /* Reset detail panel when client selection changes */
  useEffect(() => {
    setPanel({ mode: "empty" })
  }, [clientId])

  const { data: users = [], isLoading } = useUsers(clientId)

  const handleSelectUser = (id: number) => {
    setPanel({ mode: "edit", userId: id })
  }

  const handleNewUser = () => {
    setPanel({ mode: "create" })
  }

  const handleSaved = (newId?: number) => {
    if (newId) {
      setPanel({ mode: "edit", userId: newId })
    } else {
      setPanel({ mode: "empty" })
    }
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
          <h1 className="text-xl font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage users with role assignments and access controls.
          </p>
        </div>
      </div>

      {/* Master-Detail layout */}
      <div className="flex-1 min-h-0 flex rounded-xl border border-border/60 overflow-hidden">

        {/* LEFT: User list */}
        <div className="w-72 shrink-0 flex flex-col border-r border-border/60 bg-muted/20">

          {/* List header + New button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <span className="text-sm font-semibold text-foreground">Users</span>
            <Button
              size="sm"
              onClick={handleNewUser}
              disabled={clientId === null}
              className="cursor-pointer h-7 gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              New User
            </Button>
          </div>

          {/* User list body */}
          <div className="flex-1 overflow-y-auto">
            {clientId === null && isSuperAdmin() ? (
              /* SuperAdmin hasn't selected a client yet */
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4 py-8">
                <Users className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Select a client to view users.</p>
                <p className="text-xs text-muted-foreground/60">
                  Use the client selector in the top bar.
                </p>
              </div>
            ) : isLoading ? (
              <div className="p-3 space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Skeleton className="h-3 w-3 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4 py-8">
                <Users className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No users yet.</p>
                <p className="text-xs text-muted-foreground">
                  Click "New User" to create one.
                </p>
              </div>
            ) : (
              <ul className="p-2 space-y-0.5">
                {users.map(user => {
                  const isSelected =
                    panel.mode === "edit" && panel.userId === user.id
                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user.id)}
                        className={cn(
                          "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                          "hover:bg-muted/60",
                          isSelected && "bg-muted/80 ring-1 ring-border"
                        )}
                      >
                        {/* Active dot */}
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full shrink-0 mt-1.5",
                            user.isActive ? "bg-green-500" : "bg-muted-foreground/40"
                          )}
                        />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        {!user.isActive && (
                          <Badge
                            variant="outline"
                            className="text-xs shrink-0 px-1.5 py-0 text-muted-foreground mt-0.5"
                          >
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
              <Users className="h-12 w-12 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-medium text-foreground/60">Select a user to edit</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Or click "New User" to create one from scratch.
                </p>
              </div>
            </div>
          ) : (
            <UserDetailPanel
              key={panel.mode === "create" ? "new" : `edit-${panel.userId}`}
              userId={panel.mode === "create" ? null : panel.userId}
              clientId={clientId}
              clients={clients}
              onSaved={handleSaved}
              onCancel={handleCancel}
            />
          )}
        </div>

      </div>
    </div>
  )
}
