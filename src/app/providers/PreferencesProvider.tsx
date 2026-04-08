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
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  /* =========================================
     Apply Theme
  ========================================= */
  useEffect(() => {
    const root = document.documentElement

    root.classList.remove("light", "dark")

    if (preferences.theme === "dark") {
      root.classList.add("dark")
    } else if (preferences.theme === "light") {
      root.classList.add("light")
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.add(isDark ? "dark" : "light")
    }
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