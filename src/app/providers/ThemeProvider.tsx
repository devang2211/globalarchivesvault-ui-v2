// import { createContext, useContext, useEffect, useState } from "react"
// import { updatePreferences, getPreferences } from "@/shared/api/preferences.api"
// import { getToken } from "@/shared/lib/auth"

// type Theme = "light" | "dark" | "system"

// const ThemeContext = createContext<{
//   theme: Theme
//   setTheme: (t: Theme) => void
// } | null>(null)

// export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
//   const [theme, setThemeState] = useState<Theme>("system")

//   const applyTheme = (t: Theme) => {
//     const root = document.documentElement
//     root.classList.remove("light", "dark")

//     if (t === "system") {
//       const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
//       root.classList.add(prefersDark ? "dark" : "light")
//     } else {
//       root.classList.add(t)
//     }
//   }

//   const setTheme = async (t: Theme) => {
//     // 1. apply immediately (UX first)
//     setThemeState(t)
//     applyTheme(t)

//     // 2. persist locally
//     localStorage.setItem("theme", t)

//     // 3. sync with backend (non-blocking)
//     try {
//       await updatePreferences({ theme: t })
//     } catch {
//       // silently fail (important UX decision)
//     }
//   }

//   useEffect(() => {
//   const init = async () => {
//     const token = getToken()

//     // ✅ If logged in → fetch from API
//     if (token) {
//       try {
//         const data = await getPreferences()   // 👈 HERE

//         const apiTheme = data?.theme
//         if (apiTheme) {
//           setThemeState(apiTheme)
//           applyTheme(apiTheme)
//           return
//         }
//       } catch {
//         // fallback silently
//       }
//     }

//     // ✅ fallback → localStorage
//     const saved = (localStorage.getItem("theme") as Theme) || "system"
//     setThemeState(saved)
//     applyTheme(saved)
//   }

//   init()
// }, [])

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   )
// }

// export const useTheme = () => {
//   const ctx = useContext(ThemeContext)
//   if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
//   return ctx
// }