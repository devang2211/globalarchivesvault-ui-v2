// import { createContext, useContext, useState } from "react"

// type LayoutContextType = {
//   collapsed: boolean
//   setCollapsed: (v: boolean) => void
//   mobileOpen: boolean
//   setMobileOpen: (v: boolean) => void
// }

// const LayoutContext = createContext<LayoutContextType | null>(null)

// export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
//   const [collapsed, setCollapsed] = useState(false)
//   const [mobileOpen, setMobileOpen] = useState(false)

//   return (
//     <LayoutContext.Provider
//       value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}
//     >
//       {children}
//     </LayoutContext.Provider>
//   )
// }

// export const useLayout = () => {
//   const ctx = useContext(LayoutContext)
//   if (!ctx) throw new Error("useLayout must be used inside LayoutProvider")
//   return ctx
// }

import { createContext, useContext, useEffect, useState } from "react"

const LayoutContext = createContext<any>(null)

export const LayoutProvider = ({ children }: any) => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1024px)")

    const handleChange = () => {
      const mobile = media.matches
      setIsMobile(mobile)

      if (mobile) {
        setCollapsed(true) // force collapse on mobile
      } else {
        // restore user preference
        const saved = localStorage.getItem("sidebar-collapsed")
        setCollapsed(saved === "true")
      }
    }

    handleChange()
    media.addEventListener("change", handleChange)

    return () => media.removeEventListener("change", handleChange)
  }, [])

  const toggle = () => {
    // if (isMobile) return // optional: disable toggle on mobile

    setCollapsed((prev: boolean) => {
      const next = !prev
      localStorage.setItem("sidebar-collapsed", String(next))
      return next
    })
  }

  return (
    <LayoutContext.Provider value={{ collapsed, toggle }}>
      {children}
    </LayoutContext.Provider>
  )
}

export const useLayout = () => useContext(LayoutContext)