import { createContext, useContext, useEffect, useState } from "react"

type FontType = "inter" | "manrope" | "system"

type PreferencesContextType = {
  font: FontType
  setFont: (font: FontType) => void
}

const PreferencesContext = createContext<PreferencesContextType | null>(null)

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [font, setFont] = useState<FontType>("inter")

  useEffect(() => {
    const saved = localStorage.getItem("font") as FontType
    if (saved) setFont(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem("font", font)
  }, [font])

  return (
    <PreferencesContext.Provider value={{ font, setFont }}>
      <div className={`font-${font}`}>
        {children}
      </div>
    </PreferencesContext.Provider>
  )
}

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider")
  return ctx
}