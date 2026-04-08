import { cn } from "@/lib/utils"
import { usePreferences } from "@/app/providers/PreferencesProvider"
import {
  ThemePreview,
  SidebarPreview,
  LayoutPreview,
  DirectionPreview,
} from "@/components/ui/preview-blocks"

/* =========================================
   Option Card
========================================= */
type OptionCardProps = {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

const OptionCard = ({
  label,
  active,
  onClick,
  children,
}: OptionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-md border p-2 text-left transition cursor-pointer",
        "hover:border-muted-foreground",
        active
          ? "border-primary ring-2 ring-primary/20"
          : "border-border"
      )}
    >
      {children}

      {active && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">
          ✓
        </div>
      )}

      <div className="mt-2 text-xs text-center capitalize">
        {label}
      </div>
    </button>
  )
}

/* =========================================
   Theme Settings
========================================= */
export const ThemeSettings = () => {
  const { preferences, updatePreference } = usePreferences()

  return (
    <div className="space-y-8">

      {/* THEME */}
      <div className="space-y-3 pb-6 border-b border-border">
        <p className="text-sm font-medium tracking-tight">Theme</p>

        <div className="grid grid-cols-3 gap-3">
          {["system", "light", "dark"].map((theme) => (
            <OptionCard
              key={theme}
              label={theme}
              active={preferences.theme === theme}
              onClick={() => updatePreference("theme", theme)}
            >
                <ThemePreview type={theme} />
            </OptionCard>
          ))}
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="space-y-3 pb-6 border-b border-border">
        <p className="text-sm font-medium tracking-tight">Sidebar</p>

        <div className="grid grid-cols-3 gap-3">
          {["default", "inset", "floating"].map((variant) => (
            <OptionCard
              key={variant}
              label={variant}
              active={preferences.sidebar === variant}
              onClick={() => updatePreference("sidebar", variant)}
            >
                <SidebarPreview type={variant} />

            </OptionCard>
          ))}
        </div>
      </div>

      {/* LAYOUT */}
      <div className="space-y-3 pb-6 border-b border-border">
        <p className="text-sm font-medium tracking-tight">Layout</p>

        <div className="grid grid-cols-3 gap-3">
          {["default", "compact", "full"].map((layout) => (
            <OptionCard
              key={layout}
              label={layout}
              active={preferences.layout === layout}
              onClick={() => updatePreference("layout", layout)}
            >
                <LayoutPreview type={layout} />

            </OptionCard>
          ))}
        </div>
      </div>

      {/* DIRECTION */}
      <div className="space-y-3">
        <p className="text-sm font-medium tracking-tight">Direction</p>

        <div className="grid grid-cols-2 gap-3">
          {["ltr", "rtl"].map((dir) => (
            <OptionCard
              key={dir}
              label={dir}
              active={preferences.direction === dir}
              onClick={() => updatePreference("direction", dir)}
            >
                <DirectionPreview type={dir} />

            </OptionCard>
          ))}
        </div>
      </div>

      {/* RESET */}
      <button
        onClick={() => {
          updatePreference("theme", "light")
          updatePreference("sidebar", "default")
          updatePreference("layout", "default")
          updatePreference("direction", "ltr")
        }}
        className="w-full mt-6 text-sm text-destructive hover:underline cursor-pointer"
      >
        Reset to defaults
      </button>

    </div>
  )
}