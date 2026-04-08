import { Outlet } from "@tanstack/react-router"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { useState, useEffect  } from "react"

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    return saved === "true"
  })

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed))
  }, [isCollapsed])

  return (
    <div className="min-h-screen bg-muted/40 p-3">

      <div className="flex h-[calc(100vh-24px)] gap-3">

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isCollapsed}
          setIsOpen={setIsSidebarOpen}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Main */}
        <div className="flex-1 flex flex-col rounded-xl border border-border bg-background shadow-sm overflow-hidden">

          <Topbar
  onMenuClick={() => setIsSidebarOpen(true)}
  onCollapseToggle={() => setIsCollapsed(prev => !prev)}
/>

          <main className="flex-1 px-6 py-6 overflow-auto">
            <Outlet />
          </main>

        </div>
      </div>

      {/* Overlay (mobile only) */}
{isSidebarOpen && (
  <div
    className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 lg:hidden"
    onClick={() => setIsSidebarOpen(false)}
  />
)}
    </div>
  )
}