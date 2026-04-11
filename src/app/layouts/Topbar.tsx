import { PanelLeft, Settings } from "lucide-react"
import { useState } from "react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { ThemeSettingsDrawer } from "@/features/preferences/components/ThemeSettingsDrawer"
import { UserMenu } from "./UserMenu"
import { cn } from "@/lib/utils"

type Props = {
  isCollapsed: boolean
  onMenuClick: () => void
  onCollapseToggle: () => void
}

export const Topbar = ({ isCollapsed, onMenuClick, onCollapseToggle }: Props) => {
  const [openSettings, setOpenSettings] = useState(false)
  const [openCollapseTooltip, setOpenCollapseTooltip] = useState(false)

  return (
    <>
      <div className="h-14 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur-sm">

        {/* LEFT */}
        <div className="flex items-center gap-2">
          {/* Mobile: open sidebar overlay */}
          <button
            onClick={onMenuClick}
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer transition"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          {/* Desktop: collapse / expand with tooltip */}
          <Tooltip.Provider delayDuration={400}>
            <Tooltip.Root open={openCollapseTooltip} onOpenChange={setOpenCollapseTooltip} disableHoverableContent>
              <Tooltip.Trigger asChild onPointerDown={() => setOpenCollapseTooltip(false)}>
                <button
                  onClick={onCollapseToggle}
                  className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted cursor-pointer transition"
                >
                  <PanelLeft className={cn(
                    "h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isCollapsed && "rotate-180"
                  )} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  sideOffset={6}
                  style={{ zIndex: 9999 }}
                  className="rounded-md px-3 py-1.5 text-xs bg-primary text-primary-foreground shadow-sm"
                >
                  {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  <Tooltip.Arrow className="fill-primary" width={8} height={5} />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenSettings(true)}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer transition"
          >
            <Settings className="h-4 w-4" />
          </button>

          <UserMenu />
        </div>
      </div>

      <ThemeSettingsDrawer
        open={openSettings}
        onOpenChange={setOpenSettings}
      />
    </>
  )
}
