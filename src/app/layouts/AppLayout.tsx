import { Outlet } from "@tanstack/react-router"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { useState } from "react"

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    // <div className="min-h-screen bg-muted/40 p-3">
    <div className="min-h-screen bg-background">

      {/* 🔥 ONE SINGLE CONTAINER */}
      {/* <div className="flex h-[calc(100vh-24px)] rounded-xl border border-border bg-background shadow-sm overflow-hidden"> */}
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isCollapsed}
          setIsOpen={setIsSidebarOpen}
          setIsCollapsed={setIsCollapsed}
        />

        {/* 🔥 VERTICAL SEPARATOR */}
        <div className="w-px bg-border" />

        {/* Main */}
        <div className="flex-1 min-w-0  min-h-0 flex flex-col">


          <Topbar
            onMenuClick={() => setIsSidebarOpen(true)}
            onCollapseToggle={() => setIsCollapsed((prev) => !prev)}
          />

          <main className="flex-1 min-h-0 overflow-auto px-6 py-6">
            <Outlet />
          </main>

        </div>
      </div>

      {/* Overlay (mobile) */}
      {isSidebarOpen && (
        <div
          className="
      fixed inset-0 z-40
      bg-black/30 backdrop-blur-[2px]
      lg:hidden
    "
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}