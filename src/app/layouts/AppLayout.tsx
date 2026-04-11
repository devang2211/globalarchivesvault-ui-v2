import { Outlet } from "@tanstack/react-router"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { Footer } from "./Footer"
import { useState, useEffect } from "react"
import { usePreferences } from "@/app/providers/PreferencesProvider"
import { cn } from "@/lib/utils"

const SIDEBAR_KEY = "sidebar-collapsed"

const readStoredCollapsed = (): boolean => {
  try { return localStorage.getItem(SIDEBAR_KEY) === "true" } catch { return false }
}

const saveCollapsed = (value: boolean) => {
  try { localStorage.setItem(SIDEBAR_KEY, String(value)) } catch {}
}

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(readStoredCollapsed)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)

  const { preferences } = usePreferences()

  const sidebarVariant = preferences.sidebar
  const isFloating = sidebarVariant === "floating"
  const isInset = sidebarVariant === "inset"

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)")

    const update = (e: MediaQueryList | MediaQueryListEvent) => {
      const mobile = e.matches
      setIsMobile(mobile)
      if (mobile) {
        setIsCollapsed(true)
      } else {
        setIsCollapsed(readStoredCollapsed())
      }
    }

    update(media)
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

        {/* Main area */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
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

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
