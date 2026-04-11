import { cn } from "@/lib/utils"

/* =========================================
   BASE PREVIEW CONTAINER
========================================= */
const Box = ({ className }: { className?: string }) => (
  <div className={cn("rounded-sm", className)} />
)

/* =========================================
   THEME PREVIEWS
========================================= */
export const ThemePreview = ({ type }: { type: string }) => {
  const isDark = type === "dark"

  return (
    <div
      className={cn(
        "h-16 rounded-md border overflow-hidden",
        isDark ? "bg-[#0f172a]" : "bg-white"
      )}
    >
      {/* Topbar */}
      <div
        className={cn(
          "h-3",
          isDark ? "bg-[#1e293b]" : "bg-gray-100"
        )}
      />

      {/* Content */}
      <div className="flex gap-1 p-1">
        <Box
          className={cn(
            "w-1/3 h-6",
            isDark ? "bg-[#1e293b]" : "bg-gray-200"
          )}
        />
        <Box
          className={cn(
            "flex-1 h-6",
            isDark ? "bg-[#334155]" : "bg-gray-300"
          )}
        />
      </div>
    </div>
  )
}

/* =========================================
   SIDEBAR PREVIEWS
========================================= */
export const SidebarPreview = ({ type }: { type: string }) => {
  return (
    <div className="h-16 rounded-md border bg-muted overflow-hidden flex">
      {/* Sidebar */}
      <div
        className={cn(
          "h-full",
          type === "inset"
            ? "w-3 ml-1 rounded-sm bg-gray-400"
            : "w-4 bg-gray-400"
        )}
      />

      {/* Content */}
      <div className="flex-1 p-1">
        <div className="h-2 bg-gray-300 rounded-sm mb-1" />
        <div className="h-2 bg-gray-200 rounded-sm w-2/3" />
      </div>
    </div>
  )
}

/* =========================================
   LAYOUT PREVIEWS
========================================= */
export const LayoutPreview = ({ type }: { type: string }) => {
  return (
    <div className="h-16 rounded-md border bg-muted p-1">
      <div
        className={cn(
          "h-full bg-gray-300 rounded-sm",
          type === "compact" && "mx-1",
          type === "full" && "mx-0",
          type === "default" && "mx-2"
        )}
      />
    </div>
  )
}

/* =========================================
   DIRECTION PREVIEWS
========================================= */
export const DirectionPreview = ({ type }: { type: string }) => {
  return (
    <div className="h-16 rounded-md border bg-muted p-2 flex">
      {type === "rtl" ? (
        <>
          <div className="flex-1 flex justify-end gap-1">
            <div className="w-2 h-6 bg-gray-300 rounded-sm" />
            <div className="w-4 h-6 bg-gray-400 rounded-sm" />
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 flex gap-1">
            <div className="w-4 h-6 bg-gray-400 rounded-sm" />
            <div className="w-2 h-6 bg-gray-300 rounded-sm" />
          </div>
        </>
      )}
    </div>
  )
}

/* =========================================
   FONT PREVIEWS
========================================= */
const fontFamilyMap: Record<string, string> = {
  inter: '"Inter", sans-serif',
  manrope: '"Manrope", sans-serif',
  system: 'system-ui, -apple-system, sans-serif',
}

export const FontPreview = ({ type }: { type: string }) => {
  return (
    <div
      className="h-16 rounded-md border bg-muted flex flex-col items-center justify-center gap-0.5"
      style={{ fontFamily: fontFamilyMap[type] }}
    >
      <span className="text-base font-semibold text-foreground leading-none">Ag</span>
      <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
    </div>
  )
}