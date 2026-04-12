import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ChevronDown,
  Settings2,
  SlidersHorizontal,
  FolderOpen,
  Scale,
  ScrollText,
} from "lucide-react"
import { useRouterState, Link } from "@tanstack/react-router"
import * as Tooltip from "@radix-ui/react-tooltip"
import * as Popover from "@radix-ui/react-popover"
import { useState, useEffect } from "react"
import { getAuth } from "@/shared/lib/auth"
import { getInitials } from "@/lib/avatar"
import { formatUserType } from "@/lib/format"

type SidebarVariant = "default" | "inset" | "floating"

type Props = {
  isOpen: boolean
  isCollapsed: boolean
  isMobile: boolean
  setIsOpen: (v: boolean) => void
  variant?: SidebarVariant
}

type NavItem =
  | { title: string; url: string; icon?: any; roles?: string[] }
  | { title: string; items: { title: string; url: string; roles?: string[] }[] }

type NavGroup = {
  title: string
  items: NavItem[]
}

const iconMap: Record<string, any> = {
  Dashboard: LayoutDashboard,
  "Administration": Settings2,
  "Records Configuration": SlidersHorizontal,
  "Records Management": FolderOpen,
  Compliance: Scale,
  "Audit & Monitoring": ScrollText,
}

/* Static nav structure — defined outside the component to avoid recreation on every render */
const NAV_GROUPS: NavGroup[] = [
  {
    title: "General",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Pages",
    items: [
      {
        title: "Administration",
        items: [
          { title: "Pricing Tier Configuration", url: "/pricing-tier/configure", roles: ["SuperAdmin"] },
          { title: "Client Management", url: "/client-management", roles: ["SuperAdmin"] },
          { title: "Role Management", url: "/roles", roles: ["SuperAdmin"] },
          { title: "Organization Configuration", url: "/organization", roles: ["ClientAdmin"] },
          { title: "Users Management", url: "/users", roles: ["SuperAdmin", "ClientAdmin"] },
        ],
      },
      {
        title: "Records Configuration",
        items: [
          { title: "Taxonomy", url: "/taxonomy", roles: ["SuperAdmin"] },
          { title: "Metadata", url: "/metadata", roles: ["SuperAdmin"] },
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
        items: [{ title: "Audit Logs", url: "/audit/logs" }],
      },
    ],
  },
]

const tooltipContentClass = "rounded-md px-3 py-1.5 text-xs bg-primary text-primary-foreground shadow-sm"
const TooltipArrow = () => (
  <Tooltip.Arrow className="fill-primary" width={8} height={5} />
)

/* Controlled tooltip — closes on click and whenever pathname changes */
const NavTooltip = ({ label, children, pathname }: { label: string; children: React.ReactNode; pathname: string }) => {
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [pathname])
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root open={open} onOpenChange={setOpen} disableHoverableContent>
        <Tooltip.Trigger asChild onPointerDown={() => setOpen(false)}>
          {children as React.ReactElement}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content side="right" sideOffset={8} style={{ zIndex: 9999 }} className={tooltipContentClass}>
            {label}
            <TooltipArrow />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

/* Collapses label width + fades during collapse transition */
const Label = ({ children, isCollapsed }: { children: React.ReactNode; isCollapsed: boolean }) => (
  <span
    className={cn(
      "whitespace-nowrap overflow-hidden",
      "transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
      isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[200px] delay-150"
    )}
  >
    {children}
  </span>
)

/* Left-padding spacer that smoothly slides the icon to centre when collapsed */
const NavSpacer = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <span
    className={cn(
      "shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
      isCollapsed ? "w-[20px]" : "w-3"
    )}
  />
)

export const Sidebar = ({
  isOpen,
  isCollapsed,
  isMobile,
  setIsOpen,
  variant = "default",
}: Props) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  // Visual "collapsed" state: only apply icon-only mode on desktop when truly collapsed.
  // On mobile the sidebar is a full-width overlay, so labels/headers must always show.
  const showCollapsed = isCollapsed && !isMobile

  const toggleMenu = (key: string) =>
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }))

  const user = getAuth()

  const filterItems = (items: NavItem[]): NavItem[] =>
    items
      .map((item): NavItem => {
        if ("items" in item) {
          return {
            ...item,
            items: filterItems(item.items) as { title: string; url: string; roles?: string[] }[],
          }
        }
        return item
      })
      .filter((item) => {
        if (!("items" in item) && item.roles) {
          const userType = user?.userType
          if (!userType || !item.roles.includes(userType)) return false
        }
        if ("items" in item && item.items.length === 0) return false
        return true
      })

  const filteredNavGroups = NAV_GROUPS
    .map((group: NavGroup) => ({ ...group, items: filterItems(group.items) }))
    .filter((group: NavGroup) => group.items.length > 0)

  useEffect(() => {
    const newState: Record<string, boolean> = {}
    NAV_GROUPS.forEach((group: NavGroup) => {
      group.items.forEach((item: NavItem) => {
        if ("items" in item) {
          const hasActive = item.items.some((sub: { url: string }) => sub.url === pathname)
          if (hasActive) newState[item.title] = true
        }
      })
    })
    setOpenMenus(prev => ({ ...prev, ...newState }))
  }, [pathname])

  return (
    <aside
      className={cn(
        "flex flex-col bg-background overflow-hidden",

        // Width transition only — avoids interfering with mobile transform
        "lg:transition-[width] lg:duration-300 lg:ease-[cubic-bezier(0.22,1,0.36,1)]",
        isCollapsed ? "lg:w-[72px]" : "lg:w-64",

        // Desktop static positioning
        "lg:static lg:translate-x-0 lg:shrink-0",

        // Mobile: slide in/out via transform
        "fixed inset-y-0 left-0 z-50 w-72",
        "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [will-change:transform]",
        isOpen ? "translate-x-0" : "-translate-x-full",

        // Variant — separator div handles the default edge; floating uses a soft card shadow
        variant === "floating" && "lg:my-2 lg:ms-2 lg:rounded-xl lg:border lg:border-border lg:shadow-[0_2px_12px_-2px_hsl(var(--foreground)/0.06),0_1px_4px_-1px_hsl(var(--foreground)/0.04)]",
      )}
    >
      {/* HEADER */}
      <div className={cn("flex items-center px-3 py-3", showCollapsed && "justify-center")}>
        <img
          src="/logo.svg"
          alt="Global Archives"
          className={cn(
            "object-contain transition-[width,height] duration-300",
            showCollapsed ? "h-8 w-8" : "h-8 w-auto"
          )}
        />
      </div>

      {/* NAV */}
      <div className="flex-1 overflow-y-auto scroll-smooth sidebar-scroll px-2 py-3 space-y-4">
        {filteredNavGroups.map((group: NavGroup) => (
          <div key={group.title}>

            {/* Group label */}
            <div
              className={cn(
                "px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide",
                "overflow-hidden transition-[opacity,max-height] duration-200",
                showCollapsed ? "opacity-0 max-h-0 mb-0" : "opacity-100 max-h-8 delay-100"
              )}
            >
              {group.title}
            </div>

            <div className="space-y-1">
              {group.items.map((item: NavItem) => {
                const isOpenMenu = openMenus[item.title]

                /* SIMPLE LINK */
                if (!("items" in item)) {
                  const isActive = pathname === item.url

                  const link = (
                    <Link
                      key={item.title}
                      to={item.url || "#"}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "group flex items-center py-2 pr-3 rounded-md text-sm",
                        "transition-[background,color] duration-150 ease-in-out cursor-pointer",
                        isActive
                          ? "text-foreground font-medium relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-[2px] before:bg-primary before:rounded"
                          : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <NavSpacer isCollapsed={showCollapsed} />
                      {item.icon && (
                        <item.icon className={cn("h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100 transition-[margin,opacity]", !showCollapsed && "mr-3")} />
                      )}
                      <Label isCollapsed={showCollapsed}>{item.title}</Label>
                    </Link>
                  )

                  return showCollapsed ? (
                    <NavTooltip key={item.title} label={item.title} pathname={pathname}>
                      {link}
                    </NavTooltip>
                  ) : link
                }

                /* NESTED MENU */
                const Icon = iconMap[item.title] || LayoutDashboard

                /* COLLAPSED (desktop only) → tooltip + right-side popover submenu */
                if (showCollapsed) {
                  return (
                    <Popover.Root key={item.title}>
                      <NavTooltip label={item.title} pathname={pathname}>
                        <Popover.Trigger asChild>
                          <button
                            className={cn(
                              "group w-full flex items-center py-2 pr-3 rounded-md text-sm",
                              "text-foreground/80 font-medium",
                              "hover:text-foreground hover:bg-muted/50",
                              "transition-[background,color] duration-150 cursor-pointer",
                            )}
                          >
                            <NavSpacer isCollapsed={showCollapsed} />
                            <Icon className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100 transition-[margin,opacity]" />
                          </button>
                        </Popover.Trigger>
                      </NavTooltip>

                      <Popover.Portal>
                        <Popover.Content
                          side="right"
                          sideOffset={8}
                          align="start"
                          style={{ zIndex: 9999 }}
                          className="min-w-[180px] rounded-md border border-border bg-background shadow-lg p-1"
                        >
                          <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {item.title}
                          </p>
                          {item.items?.map((sub: { title: string; url: string; roles?: string[] }) => {
                            const isActive = pathname === sub.url
                            return (
                              <Popover.Close asChild key={sub.title}>
                                <Link
                                  to={sub.url || "#"}
                                  onClick={() => setIsOpen(false)}
                                  className={cn(
                                    "block px-2 py-1.5 rounded-md text-sm",
                                    "transition-[background,color] duration-150 cursor-pointer",
                                    isActive
                                      ? "text-foreground font-medium bg-muted"
                                      : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
                                  )}
                                >
                                  {sub.title}
                                </Link>
                              </Popover.Close>
                            )
                          })}
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  )
                }

                /* EXPANDED → accordion */
                return (
                  <div key={item.title}>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={cn(
                        "group w-full flex items-center",
                        "py-2 pr-3 text-sm rounded-md",
                        "text-foreground/80 font-medium",
                        "hover:text-foreground hover:bg-muted/50",
                        "transition-[background,color] duration-150 cursor-pointer",
                      )}
                    >
                      <NavSpacer isCollapsed={showCollapsed} />
                      <Icon className={cn("h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100 transition-[margin,opacity]", !showCollapsed && "mr-3")} />
                      <Label isCollapsed={showCollapsed}>{item.title}</Label>
                      <span className="flex-1" />
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 overflow-hidden",
                          "transition-[transform,opacity,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          isOpenMenu && "rotate-180",
                          "opacity-70 max-w-4"
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                        isOpenMenu ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="ml-3 border-l border-border/40 pl-2 overflow-hidden">
                        <div className="space-y-1 py-1">
                          {item.items?.map((sub: { title: string; url: string; roles?: string[] }) => {
                            const isActive = pathname === sub.url
                            return (
                              <Link
                                key={sub.title}
                                to={sub.url || "#"}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "block px-3 py-2 rounded-md text-sm whitespace-nowrap overflow-hidden",
                                  "transition-[background,color] duration-150 cursor-pointer",
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
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-auto px-2 pb-2">
        <button className="w-full flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted transition-colors cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
            {getInitials(user?.name)}
          </div>
          <div
            className={cn(
              "flex flex-col text-left overflow-hidden transition-[opacity,max-width] duration-150",
              showCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[160px] delay-150"
            )}
          >
            <span className="text-sm font-medium truncate">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{formatUserType(user?.userType)}</span>
          </div>
        </button>
      </div>
    </aside>
  )
}
