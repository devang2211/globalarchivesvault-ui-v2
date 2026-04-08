import { Menu, PanelLeft } from "lucide-react"

type Props = {
  onMenuClick: () => void        // mobile
  onCollapseToggle: () => void   // desktop
}

export const Topbar = ({ onMenuClick, onCollapseToggle }: Props) => {
  return (
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
        <button
          onClick={onCollapseToggle}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted cursor-pointer active:scale-95 transition"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center cursor-pointer">
          G
        </div>
      </div>
    </div>
  )
}