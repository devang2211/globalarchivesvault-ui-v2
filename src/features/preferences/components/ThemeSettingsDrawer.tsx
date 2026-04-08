import * as Dialog from "@radix-ui/react-dialog"
import { ThemeSettings } from "./ThemeSettings"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export const ThemeSettingsDrawer = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>

        {/* Overlay */}
        <Dialog.Overlay
          forceMount
          className="
            fixed inset-0 z-40
            bg-black/30 backdrop-blur-[2px]
            transition-opacity duration-300
            data-[state=open]:opacity-100
            data-[state=closed]:opacity-0
          "
        />

        {/* Drawer */}
        <Dialog.Content
          forceMount
          className="
            fixed right-0 top-0 h-full w-[420px] z-50
            bg-background border-l border-border shadow-xl

            flex flex-col

            transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
            data-[state=open]:translate-x-0
            data-[state=closed]:translate-x-full
          "
        >
          {/* HEADER */}
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight">
                Preferences
              </h2>
              <p className="text-xs text-muted-foreground">
                Customize your experience
              </p>
            </div>

            <Dialog.Close className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer">
              ✕
            </Dialog.Close>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <ThemeSettings />
          </div>
        </Dialog.Content>

      </Dialog.Portal>
    </Dialog.Root>
  )
}