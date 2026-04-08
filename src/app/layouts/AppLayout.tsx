// import { Outlet } from "@tanstack/react-router"
// import { Sidebar } from "./Sidebar"
// import { Topbar } from "./Topbar"
// import { useState, useEffect  } from "react"
// import { cn } from "@/lib/utils"
// import { usePreferences } from "../providers/PreferencesProvider"

// export const AppLayout = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false)

//   const [isCollapsed, setIsCollapsed] = useState(() => {
//     const saved = localStorage.getItem("sidebar-collapsed")
//     return saved === "true"
//   })

//   const { preferences } = usePreferences()

//   useEffect(() => {
//     localStorage.setItem("sidebar-collapsed", String(isCollapsed))
//   }, [isCollapsed])

//   return (
//     <div className="min-h-screen bg-muted/40 p-3">

//       <div
//   className={cn(
//     "flex h-[calc(100vh-24px)]",

//     preferences.sidebar === "floating" && "gap-3 p-3",
//     preferences.sidebar === "inset" && "px-3",
//     preferences.sidebar === "default" && "gap-0"
//   )}
// >

//         {/* Sidebar */}
//         <Sidebar
//           isOpen={isSidebarOpen}
//           isCollapsed={isCollapsed}
//           setIsOpen={setIsSidebarOpen}
//           setIsCollapsed={setIsCollapsed}
//         />

//         {/* Main */}
//         <div className="flex-1 flex flex-col rounded-xl border border-border bg-background shadow-sm overflow-hidden">

//           <Topbar
//   onMenuClick={() => setIsSidebarOpen(true)}
//   onCollapseToggle={() => setIsCollapsed(prev => !prev)}
// />

//           <main className="flex-1 px-6 py-6 overflow-auto">
//             <Outlet />
//           </main>

//         </div>
//       </div>

//       {/* Overlay (mobile only) */}
// {isSidebarOpen && (
//   <div
//     className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 lg:hidden"
//     onClick={() => setIsSidebarOpen(false)}
//   />
// )}
//     </div>
//   )
// }


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
      <div className="flex h-screen bg-background overflow-hidden">

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
        <div className="flex-1 flex flex-col">

          <Topbar
            onMenuClick={() => setIsSidebarOpen(true)}
            onCollapseToggle={() => setIsCollapsed((prev) => !prev)}
          />

          <main className="flex-1 px-6 py-6 overflow-auto">
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