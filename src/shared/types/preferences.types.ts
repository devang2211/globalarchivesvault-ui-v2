export type Theme = "light" | "dark" | "system"
export type SidebarVariant = "default" | "inset" | "floating"
export type LayoutDensity = "default" | "compact" | "full"
export type Direction = "ltr" | "rtl"
export type Font = "inter" | "manrope" | "system"

export type Preferences = {
  theme: Theme
  sidebar: SidebarVariant
  layout: LayoutDensity
  direction: Direction,
  font: Font
}