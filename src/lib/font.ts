export type FontType = "manrope" | "inter" | "system"

export const setFont = (font: FontType) => {
  const root = document.documentElement

  root.classList.remove("font-manrope", "font-inter", "font-system")

  if (font === "manrope") root.classList.add("font-manrope")
  if (font === "inter") root.classList.add("font-inter")
  if (font === "system") root.classList.add("font-system")

  localStorage.setItem("font", font)
}

export const initFont = () => {
  const saved = localStorage.getItem("font") as FontType | null
  if (saved) setFont(saved)
}