import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import type { Preferences } from "@/shared/types/preferences.types"
import { setFont } from "@/lib/font"

/* =========================================
   Default Preferences
========================================= */
const defaultPreferences: Preferences = {
  theme: "light",
  sidebar: "default",
  layout: "default",
  direction: "ltr",
  font: "inter",
}

/* =========================================
   Context
========================================= */
type PreferencesContextType = {
  preferences: Preferences
  updatePreference: (key: keyof Preferences, value: any) => void
  resetPreferences: () => void
}

const PreferencesContext = createContext<PreferencesContextType | null>(null)

/* =========================================
   Provider
========================================= */
export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  /* =========================================
     State
  ========================================= */
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem("preferences")
      return saved ? JSON.parse(saved) : defaultPreferences
    } catch {
      return defaultPreferences
    }
  })

  /* =========================================
     Update Function
  ========================================= */
  const updatePreference = (key: keyof Preferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
  }

  /* =========================================
     Apply Theme
  ========================================= */
  useEffect(() => {
    const root = document.documentElement

    if (preferences.theme !== "system") {
      root.classList.remove("light", "dark")
      root.classList.add(preferences.theme)
      return
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      root.classList.remove("light", "dark")
      root.classList.add(media.matches ? "dark" : "light")
    }
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [preferences.theme])

  /* =========================================
     Apply Direction
  ========================================= */
  useEffect(() => {
    document.documentElement.dir = preferences.direction
  }, [preferences.direction])

  useEffect(() => {
  setFont(preferences.font)
}, [preferences.font])

  /* =========================================
     Persist to localStorage
  ========================================= */
  useEffect(() => {
    localStorage.setItem("preferences", JSON.stringify(preferences))
  }, [preferences])

  /* =========================================
     Provider
  ========================================= */
  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

/* =========================================
   Hook
========================================= */
export const usePreferences = () => {
  const context = useContext(PreferencesContext)

  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider")
  }

  return context
}

export { defaultPreferences }