import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { LogOut, User } from "lucide-react"
import { useSignOut } from "@/features/auth/hooks/useSignOut"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { clearAuth, getAuth } from "@/shared/lib/auth"
import { getInitials } from "@/lib/avatar"

export const UserMenu = () => {
  const user = getAuth()
  const signOutMutation = useSignOut()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="
            h-8 w-8 rounded-full bg-muted flex items-center justify-center
            cursor-pointer hover:bg-muted/80 active:scale-95 transition
            outline-none focus-visible:ring-2 focus-visible:ring-ring/40
          "
        >
          {getInitials(user?.name)}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align="end"
        sideOffset={8}
        className="
          z-50 w-56 rounded-md border border-border bg-background shadow-md
          p-1 animate-in fade-in zoom-in-95
          data-[state=open]:animate-in data-[state=closed]:animate-out
        "
      >
        {/* PROFILE */}
        <div className="px-3 py-2 text-sm">
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>

        <DropdownMenu.Separator className="my-1 h-px bg-border" />

        <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-pointer outline-none focus:outline-none focus:bg-muted data-[highlighted]:bg-muted data-[highlighted]:text-foreground">
          <User className="h-4 w-4" />
          Profile
        </DropdownMenu.Item>

        <DropdownMenu.Separator className="my-1 h-px bg-border" />

        {/* LOGOUT */}
        <DropdownMenu.Item
          onSelect={() => {
            clearAuth()
            queryClient.clear()
            navigate({ to: "/sign-in" })
            toast.success("You've been signed out!")
            signOutMutation.mutateAsync().catch(() => {})
          }}
          className="
            flex items-center gap-2 px-3 py-2 text-sm rounded-md
            text-destructive cursor-pointer transition
            hover:bg-destructive/10 active:bg-destructive/20
            focus:outline-none data-[highlighted]:bg-destructive/10
          "
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}