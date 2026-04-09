import { PanelLeft, Settings } from "lucide-react"
import { useState } from "react"
import { ThemeSettingsDrawer } from "@/features/preferences/components/ThemeSettingsDrawer"
import { UserMenu } from "./UserMenu"

type Props = {
  onMenuClick: () => void
  onCollapseToggle: () => void
}

export const Topbar = ({ onMenuClick, onCollapseToggle }: Props) => {
  const [openSettings, setOpenSettings] = useState(false)

  return (
    <>
      {/* TOPBAR */}
      <div className="h-14 flex items-center justify-between px-4">

        {/* LEFT */}
        <div className="flex items-center gap-2">
          {/* Mobile menu */}
          <button
            onClick={onMenuClick}
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer active:scale-95 transition"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          {/* Desktop collapse */}
          {/* <button
            onClick={onCollapseToggle}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted cursor-pointer active:scale-95 transition"
          >
            <PanelLeft className="h-4 w-4" />
          </button> */}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* ✅ SETTINGS BUTTON */}
          {/* <button
            onClick={() => {
              console.log("⚙️ clicked") // debug
              setOpenSettings(true)
            }}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer transition"
          >
            <Settings className="h-4 w-4" />
          </button> */}

          {/* Avatar */}
          <UserMenu />
        </div>
      </div>

      {/* ✅ CRITICAL: DRAWER MUST BE HERE */}
      {/* <ThemeSettingsDrawer
        open={openSettings}
        onOpenChange={setOpenSettings}
      /> */}
    </>
  )
}