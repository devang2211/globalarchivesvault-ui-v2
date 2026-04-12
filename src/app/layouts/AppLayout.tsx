import { Outlet } from "@tanstack/react-router"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { Footer } from "./Footer"
import { useState, useEffect } from "react"
import { usePreferences } from "@/app/providers/PreferencesProvider"
import { ClientContextProvider } from "@/app/providers/ClientContextProvider"
import { cn } from "@/lib/utils"

const SIDEBAR_KEY = "sidebar-collapsed"

const readStoredCollapsed = (): boolean => {
  try { return localStorage.getItem(SIDEBAR_KEY) === "true" } catch { return false }
}

const saveCollapsed = (value: boolean) => {
  try { localStorage.setItem(SIDEBAR_KEY, String(value)) } catch {}
}

const MOBILE_MQ = "(max-width: 1023px)"

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  // Initialise both states from the same media query to avoid a double-setState on mount.
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_MQ).matches)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const mobile = window.matchMedia(MOBILE_MQ).matches
    return mobile ? true : readStoredCollapsed()
  })

  const { preferences } = usePreferences()

  const sidebarVariant = preferences.sidebar
  const isFloating = sidebarVariant === "floating"
  const isInset = sidebarVariant === "inset"

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MQ)

    // Only handle *changes* — initial state is already set correctly above.
    const update = (e: MediaQueryListEvent) => {
      const mobile = e.matches
      setIsMobile(mobile)
      setIsCollapsed(mobile ? true : readStoredCollapsed())
    }

    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  const handleCollapseToggle = () => {
    if (isMobile) return
    setIsCollapsed(prev => {
      const next = !prev
      saveCollapsed(next)
      return next
    })
  }

  return (
    <ClientContextProvider>
    <div className={cn(
      "min-h-screen",
      (isFloating || isInset) ? "bg-muted/40" : "bg-background"
    )}>
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          setIsOpen={setIsSidebarOpen}
          variant={sidebarVariant}
        />

        {/* Separator — default variant only */}
        {sidebarVariant === "default" && (
          <div className="w-px bg-border shrink-0" />
        )}

        {/* Main area — mirror floating sidebar outer margins so the layout is symmetric */}
        <div className={cn(
          "flex-1 min-w-0 min-h-0 flex flex-col",
          isFloating && "lg:my-2 lg:me-2"
        )}>
          <Topbar
            isCollapsed={isCollapsed}
            onMenuClick={() => setIsSidebarOpen(true)}
            onCollapseToggle={handleCollapseToggle}
          />

          <main className={cn(
            "flex-1 min-h-0 overflow-auto px-6 py-6",
            isInset && "mx-2 rounded-xl bg-background border border-border"
          )}>
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>

      {/* Mobile overlay — always mounted so it can fade out smoothly */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden",
          "transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />
    </div>
    </ClientContextProvider>
  )
}
