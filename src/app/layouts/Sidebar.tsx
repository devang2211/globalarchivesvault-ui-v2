import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Home,
  Settings,
  ChevronDown,
  Users,
  Database,
  FileText,
  ShieldCheck,
  Activity,
} from "lucide-react"
import { useRouterState, Link } from "@tanstack/react-router"
import * as Tooltip from "@radix-ui/react-tooltip"
import { useState, useEffect } from "react"
import { getUser } from "@/shared/lib/auth"
import { getInitials } from "@/lib/avatar"
import { formatUserType } from "@/lib/format"

type Props = {
  isOpen: boolean
  isCollapsed: boolean
  setIsOpen: (v: boolean) => void
  setIsCollapsed: (v: boolean) => void
}

/* ---------------- TYPES ---------------- */

type NavItem =
  | {
      title: string
      url: string
      icon?: any
      roles?: string[]
      tems?: NavItem[]
    }
  | {
      title: string
      items: { title: string; url: string; roles?: string[] }[]
    }

type NavGroup = {
  title: string
  items: NavItem[]
}

/* ---------------- ICON MAP ---------------- */

const iconMap: Record<string, any> = {
  Dashboard: LayoutDashboard,
  "Administration": Users,
  "Records Configuration": Database,
  "Records Management": FileText,
  Compliance: ShieldCheck,
  "Audit & Monitoring": Activity,
}

/* ---------------- COMPONENT ---------------- */

export const Sidebar = ({
  isOpen,
  isCollapsed,
  setIsOpen,
}: Props) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  /* ---------------- AUTO OPEN ACTIVE ---------------- */

  useEffect(() => {
    const newState: Record<string, boolean> = {}

    navGroups.forEach(group => {
      group.items.forEach(item => {
        if ("items" in item) {
          const hasActive = item.items.some(sub => sub.url === pathname)
          if (hasActive) newState[item.title] = true
        }
      })
    })

    setOpenMenus(prev => ({ ...prev, ...newState }))
  }, [pathname])

  /* ---------------- MENU ---------------- */

  const navGroups: NavGroup[] = [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Pages",
      items: [
        {
          title: "Administration",
          items: [
            { title: "Pricing Tier Configuration", url: "/pricing-tier/configure", roles: ["SuperAdmin"] },
            { title: "Client Onboarding", url: "/client-onboarding", roles: ["SuperAdmin"] },
            { title: "Role Management", url: "/roles", roles: ["SuperAdmin"] },
            { title: "Organization Configuration", url: "/organization", roles: ["ClientAdmin"] },
            { title: "Users Management", url: "/users", roles: ["SuperAdmin", "ClientAdmin"] },
          ],
        },
        {
          title: "Records Configuration",
          items: [
            { title: "Taxonomy", url: "/taxonomy",  },
            { title: "Metadata", url: "/metadata" },
            { title: "Metadata Groups", url: "/metadata-groups" },
            { title: "Document Types", url: "/document-types" },
          ],
        },
        {
          title: "Records Management",
          items: [
            { title: "Upload", url: "/records/upload" },
            { title: "Search", url: "/records/search" },
          ],
        },
        {
          title: "Compliance",
          items: [
            { title: "Legal Holds", url: "/compliance/legal-holds" },
            { title: "Disposition", url: "/compliance/disposition" },
          ],
        },
        {
          title: "Audit & Monitoring",
          items: [
            { title: "Audit Logs", url: "/audit/logs" },
          ],
        },
      ],
    },
  ]
debugger;
  const user = getUser()

const filterItems = (items: NavItem[]): NavItem[] => {
  return items
    .map((item) => ({
      ...item,
      items: item.items ? filterItems(item.items) : undefined,
    }))
    .filter((item) => {
      if ("roles" in item && item.roles && !item.roles.includes(user?.userType)) {
        return false
      }

      if ("items" in item && item.items && item.items.length === 0) {
        return false
      }

      return true
    })
}

const filteredNavGroups = navGroups
  .map((group) => ({
    ...group,
    items: filterItems(group.items),
  }))
  .filter((group) => group.items.length > 0)



  return (
    <>
      {/* MOBILE OVERLAY */}
{isOpen && (
  <div
    className="fixed inset-0 z-40 lg:hidden bg-black/40 transition-opacity duration-300"
    style={{ animationDelay: "50ms" }}
    onClick={() => setIsOpen(false)}
  />
)}

      <aside
className={cn(
  "flex flex-col bg-background shadow-xl",

  // 🔥 CRITICAL: smooth open/close
  "transform-gpu will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",

  // Desktop
  "lg:static lg:translate-x-0",
  isCollapsed ? "lg:w-[72px]" : "lg:w-64",

  // Mobile
  "fixed inset-y-0 left-0 z-50 w-72",

  // Animation
  isOpen ? "translate-x-0" : "-translate-x-full"
)}
      >
        {/* HEADER */}
<div
  className={cn(
    "flex items-center px-3 py-3",
    isCollapsed && "justify-center"
  )}
>
  <img
    src="/logo.svg"
    alt="Global Archives"
    className={cn(
      "transition-all duration-200 object-contain",
      isCollapsed ? "h-8 w-8" : "h-8 w-auto"
    )}
  />
</div>

        {/* NAV */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">

          {filteredNavGroups.map(group => (
            <div key={group.title}>

              {!isCollapsed && (
                <div className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {group.title}
                </div>
              )}

              <div className="space-y-1">

                {group.items.map(item => {
                  const isOpenMenu = openMenus[item.title]

                  /* -------- SIMPLE LINK -------- */
                  if (!("items" in item)) {
                    const isActive = pathname === item.url

                    const link = (
                      <Link
                        key={item.title}
                        to={item.url || "#"}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                          "transition-all duration-150 ease-in-out cursor-pointer hover:translate-x-[2px]",

                          isCollapsed && "justify-center px-0",

                          isActive
                            ? "text-foreground font-medium relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-[2px] before:bg-primary before:rounded"
                            : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        {item.icon && (
                          <item.icon className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100 transition" />
                        )}

                        {!isCollapsed && item.title}
                      </Link>
                    )

                    return isCollapsed ? (
                      <Tooltip.Provider key={item.title} delayDuration={200}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              side="right"
                              sideOffset={8}
                              className="z-50 rounded-md px-2 py-1 text-xs bg-foreground text-background shadow-md animate-in fade-in zoom-in-95"
                            >
                              {item.title}
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    ) : link
                  }

                  /* -------- NESTED MENU -------- */
                  const Icon = iconMap[item.title] || LayoutDashboard

                  return (
                    <div key={item.title}>
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className="
                          group w-full flex items-center justify-between
                          px-3 py-2 text-sm rounded-md
                          text-foreground/80 font-medium
                          hover:text-foreground hover:bg-muted/50
                          transition-all duration-150 cursor-pointer
                        "
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 opacity-80 group-hover:opacity-100 transition" />
                          {!isCollapsed && item.title}
                        </div>

                        {!isCollapsed && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 opacity-70 transition-all duration-200",
                              isOpenMenu && "rotate-180"
                            )}
                          />
                        )}
                      </button>

                      {!isCollapsed && (
                        <div
                          className={cn(
                            "ml-3 border-l border-border/40 pl-2 overflow-hidden",
                            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                            isOpenMenu
                              ? "max-h-[500px] opacity-100"
                              : "max-h-0 opacity-0"
                          )}
                        >
                          <div className="space-y-1 py-1">

                            {item.items?.map(sub => {
                              const isActive = pathname === sub.url

                              return (
                                <Link
                                  key={sub.title}
                                  to={sub.url || "#"}
                                  onClick={() => setIsOpen(false)}
                                  className={cn(
                                    "block px-3 py-2 rounded-md text-sm",
                                    "transition-all duration-150 ease-in-out cursor-pointer hover:translate-x-[2px]",

                                    isActive
                                      ? "text-foreground font-medium relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-[2px] before:bg-primary before:rounded"
                                      : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
                                  )}
                                >
                                  {sub.title}
                                </Link>
                              )
                            })}

                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

        </div>

        {/* FOOTER */}
        <div className="mt-auto border-t border-border p-3">
  <button
    className="
      w-full flex items-center gap-2
      rounded-md p-2
      hover:bg-muted
      transition
      cursor-pointer
    "
  >
    {/* Avatar */}
    <div className="
      h-8 w-8 rounded-full
      bg-primary/10 text-primary
      flex items-center justify-center
      text-xs font-medium
      shrink-0
    ">
      {getInitials(user?.name)}
    </div>

    {/* Text (hidden when collapsed) */}
    {!isCollapsed && (
      <div className="flex flex-col text-left overflow-hidden">
        <span className="text-sm font-medium truncate">
          {user?.name}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {formatUserType(user?.userType)}
        </span>
      </div>
    )}
  </button>
</div>

      </aside>
    </>
  )
}