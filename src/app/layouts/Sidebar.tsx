// import { cn } from "@/lib/utils"
// import { LayoutDashboard, Home, Settings, PanelLeft } from "lucide-react"
// import { useRouterState } from "@tanstack/react-router"

// type Props = {
//   isOpen: boolean
//   isCollapsed: boolean
//   setIsOpen: (v: boolean) => void
//   setIsCollapsed: (v: boolean) => void
// }

// export const Sidebar = ({
//   isOpen,
//   isCollapsed,
//   setIsOpen,
//   setIsCollapsed,
// }: Props) => {
//   const navItems = [
//     { label: "Dashboard", icon: LayoutDashboard },
//     { label: "Home", icon: Home },
//     { label: "Settings", icon: Settings },
//   ]

//   return (
// <aside
//   className={cn(
//     "flex flex-col rounded-xl border border-border bg-background shadow-sm transition-transform duration-200",

//     // ✅ ALWAYS render
//     "flex",

//     // ✅ DESKTOP (inline)
//     "lg:static lg:translate-x-0",
//     isCollapsed ? "lg:w-[72px]" : "lg:w-64",

//     // ✅ MOBILE (drawer)
//     "fixed top-3 left-3 bottom-3 z-50 w-64",

//     // 👇 ONLY THIS controls visibility
//     isOpen ? "translate-x-0" : "-translate-x-full"
//   )}
// >
//       {/* Header */}
//       <div className="flex items-center justify-between px-3 py-3">
//         <div
//           className={cn(
//             "flex items-center gap-2 font-semibold text-sm",
//             isCollapsed && "justify-center w-full"
//           )}
//         >
//           <div className="h-8 w-8 rounded-md bg-primary text-white flex items-center justify-center">
//             G
//           </div>
//           {!isCollapsed && <span>Global Archives</span>}
//         </div>
//       </div>

//       {/* Nav */}
//       <div className="px-2 space-y-1">
//         {navItems.map((item) => {
//           const Icon = item.icon
//           return (
//             <button
//               key={item.label}
//               className={cn(
//                 "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition cursor-pointer",
//                 isCollapsed && "justify-center px-0"
//               )}
//               onClick={() => setIsOpen(false)} // close on mobile
//             >
//               <Icon className="h-4 w-4" />
//               {!isCollapsed && <span>{item.label}</span>}
//             </button>
//           )
//         })}
//       </div>
//     </aside>
//   )
// }

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Home,
  Settings,
} from "lucide-react"
import { useRouterState } from "@tanstack/react-router"
import * as Tooltip from "@radix-ui/react-tooltip"

type Props = {
  isOpen: boolean
  isCollapsed: boolean
  setIsOpen: (v: boolean) => void
  setIsCollapsed: (v: boolean) => void
}

export const Sidebar = ({
  isOpen,
  isCollapsed,
  setIsOpen,
}: Props) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Home", icon: Home, path: "/home" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ]

  return (
<aside
  className={cn(
    "flex flex-col bg-background transition-transform duration-300 ease-in-out",

    // ✅ DESKTOP
    "lg:static lg:translate-x-0",
    isCollapsed ? "lg:w-[72px]" : "lg:w-64",

    // ✅ MOBILE (FULL SCREEN DRAWER)
    "fixed inset-y-0 left-0 z-50 w-72",

    // 👇 CONTROL VISIBILITY
    isOpen ? "translate-x-0" : "-translate-x-full"
  )}
>
      {/* Header */}
      <div className="flex items-center px-3 py-3">
        <div
          className={cn(
            "flex items-center gap-2 font-semibold text-sm",
            isCollapsed && "justify-center w-full"
          )}
        >
          <div className="h-8 w-8 rounded-md bg-primary text-white flex items-center justify-center shrink-0">
            G
          </div>

          <span
            className={cn(
              "whitespace-nowrap transition-all duration-200",
              isCollapsed
                ? "opacity-0 w-0 overflow-hidden"
                : "opacity-100 w-auto"
            )}
          >
            Global Archives
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          const button = (
            <button
              key={item.label}
              onClick={() => setIsOpen(false)}
              className={cn(
                "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                "transition-colors duration-150 cursor-pointer",

                isCollapsed && "justify-center px-0",

                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />

              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-200",
                  isCollapsed
                    ? "opacity-0 w-0 overflow-hidden"
                    : "opacity-100 w-auto"
                )}
              >
                {item.label}
              </span>
            </button>
          )

          return isCollapsed ? (
            <Tooltip.Provider key={item.label} delayDuration={100}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>{button}</Tooltip.Trigger>

                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    sideOffset={8}
                    className="
                      z-50 rounded-md px-2 py-1 text-xs
                      bg-foreground text-background
                      shadow-md
                      animate-in fade-in zoom-in-95
                    "
                  >
                    {item.label}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          ) : (
            button
          )
        })}
      </div>
    </aside>
  )
}