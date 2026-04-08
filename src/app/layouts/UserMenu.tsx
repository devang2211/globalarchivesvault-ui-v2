import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { LogOut, Sun, Moon, Laptop } from "lucide-react"
import { useTheme } from "@/app/providers/ThemeProvider"
import { usePreferences } from "@/app/providers/PreferencesProvider"
import { Check } from "lucide-react"

export const UserMenu = () => {
    const { setTheme } = useTheme()

    const handleLogout = () => {
        localStorage.removeItem("token")
        window.location.href = "/sign-in"
    }

    const { preferences, update } = usePreferences()

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
<button
  className="
    h-8 w-8 rounded-full
    bg-muted
    text-sm font-medium
    flex items-center justify-center
    hover:bg-muted/80
    transition-colors
  "
>
  G
</button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
                align="end"
                side="bottom"
                sideOffset={8}
                className="
    w-56
    rounded-lg
    border border-border
    bg-background
    p-1
    shadow-md
    animate-in fade-in-80 zoom-in-95
    data-[side=bottom]:slide-in-from-top-1
    data-[side=top]:slide-in-from-bottom-1
  "
            >
                {/* User Info */}
                <div className="px-2 py-2 text-sm">
                    <div className="font-medium">Gaurav Patel</div>
                    <div className="text-muted-foreground text-xs">
                        gaurav@example.com
                    </div>
                </div>

                <DropdownMenu.Separator className="my-1 h-px bg-border/60" />

                {/* Theme */}
                <DropdownMenu.Label className="px-2 pt-3 pb-1 text-xs font-medium text-muted-foreground">
                    Theme
                </DropdownMenu.Label>

                <DropdownMenu.RadioGroup
                    value={preferences.theme}
                    onValueChange={(value) => update({ theme: value as any })}
                >
                    {[
                        { label: "Light", value: "light" },
                        { label: "Dark", value: "dark" },
                        { label: "System", value: "system" },
                    ].map((item) => (
                        <DropdownMenu.RadioItem
                            key={item.value}
                            value={item.value}
                            className="
  flex items-center justify-between
  px-2 py-1.5
  text-sm
  rounded-md
  cursor-pointer
  outline-none
  hover:bg-muted
  focus:bg-muted
  transition-colors
"
                        >
                            <span>{item.label}</span>

                            {preferences.theme === item.value && (
                                <Check className="h-4 w-4 text-muted-foreground" />
                            )}
                        </DropdownMenu.RadioItem>
                    ))}
                </DropdownMenu.RadioGroup>

                <DropdownMenu.Separator className="my-1 h-px bg-border/60" />

                {/* FONT */}
                <DropdownMenu.Label className="px-2 pt-3 pb-1 text-xs font-medium text-muted-foreground">
                    Font
                </DropdownMenu.Label>

                <DropdownMenu.RadioGroup
                    value={preferences.font}
                    onValueChange={(value) => update({ font: value as any })}
                >
                    {[
                        { label: "Inter", value: "inter" },
                        { label: "Manrope", value: "manrope" },
                        { label: "System", value: "system" },
                    ].map((item) => (
                        <DropdownMenu.RadioItem
                            key={item.value}
                            value={item.value}
                            className="
  flex items-center justify-between
  px-2 py-1.5
  text-sm
  rounded-md
  cursor-pointer
  outline-none
  hover:bg-muted
  focus:bg-muted
  transition-colors
"
                        >
                            <span>{item.label}</span>

                            {preferences.font === item.value && (
                                <Check className="h-4 w-4 text-muted-foreground" />
                            )}
                        </DropdownMenu.RadioItem>
                    ))}
                </DropdownMenu.RadioGroup>

                <DropdownMenu.Separator className="my-1 h-px bg-border/60" />

                {/* Logout */}
                <DropdownMenu.Item
                    onClick={handleLogout}
                    className="
  flex items-center justify-between
  px-2 py-1.5
  text-sm
  rounded-md
  cursor-pointer
  outline-none
  hover:bg-muted
  focus:bg-muted
  transition-colors
"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}