// import { createContext, useContext, useEffect, useState } from "react"

// type FontType = "inter" | "manrope" | "system"

// type PreferencesContextType = {
//   font: FontType
//   setFont: (font: FontType) => void
// }

// const PreferencesContext = createContext<PreferencesContextType | null>(null)

// export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
//   const [font, setFont] = useState<FontType>("inter")

//   useEffect(() => {
//     const saved = localStorage.getItem("font") as FontType
//     if (saved) setFont(saved)
//   }, [])

//   useEffect(() => {
//     localStorage.setItem("font", font)
//   }, [font])

//   return (
//     <PreferencesContext.Provider value={{ font, setFont }}>
//       <div className={`font-${font}`}>
//         {children}
//       </div>
//     </PreferencesContext.Provider>
//   )
// }

// export const usePreferences = () => {
//   const ctx = useContext(PreferencesContext)
//   if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider")
//   return ctx
// }


import { createContext, useContext, useEffect, useState } from "react"
import { getPreferences, updatePreferences, type Preferences } from "@/shared/api/preferences.api"

type ContextType = {
  preferences: Preferences
  update: (data: Partial<Preferences>) => void
}

const PreferencesContext = createContext<ContextType | null>(null)

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [preferences, setPreferences] = useState<Preferences>({
    theme: "system",
    font: "inter",
    density: "comfortable",
  })

  const apply = (prefs: Preferences) => {
    const root = document.documentElement

    // THEME
    root.classList.remove("light", "dark")
    if (prefs.theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.add(prefersDark ? "dark" : "light")
    } else {
      root.classList.add(prefs.theme!)
    }

    // FONT
    root.classList.remove("font-inter", "font-manrope", "font-system")
    root.classList.add(`font-${prefs.font}`)

    // DENSITY
    root.classList.remove("density-compact", "density-comfortable")
    root.classList.add(`density-${prefs.density}`)
  }

  const update = async (data: Partial<Preferences>) => {
    const updated = { ...preferences, ...data }

    // apply immediately
    setPreferences(updated)
    apply(updated)

    // persist local
    localStorage.setItem("preferences", JSON.stringify(updated))

    // sync API (non-blocking)
    try {
      await updatePreferences(data)
    } catch {}
  }

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token")

      if (token) {
        try {
          const apiPrefs = await getPreferences()
          if (apiPrefs) {
            setPreferences(apiPrefs)
            apply(apiPrefs)
            return
          }
        } catch {}
      }

      const local = localStorage.getItem("preferences")
      if (local) {
        const parsed = JSON.parse(local)
        setPreferences(parsed)
        apply(parsed)
      } else {
        apply(preferences)
      }
    }

    init()
  }, [])

  return (
    <PreferencesContext.Provider value={{ preferences, update }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider")
  return ctx
}