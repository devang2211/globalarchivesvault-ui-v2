import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Check } from "lucide-react"

type Option = {
  label: string
  value: string
}

export type FilterConfig = {
  key: string
  label: string
  options: Option[]
  value?: string[]
  onChange: (val: string[]) => void
}

type Props = {
  filters: FilterConfig[]
  children?: React.ReactNode   // ✅ custom trigger support
}

export function DataTableFilters({ filters, children }: Props) {
  return (
    <DropdownMenu.Root>
      
      {/* ✅ CUSTOM OR DEFAULT TRIGGER */}
      <DropdownMenu.Trigger asChild>
        {children ? (
          children
        ) : (
          <button
            className="
              h-9 px-3 flex items-center gap-2 rounded-md border border-border
              bg-background hover:bg-muted text-sm transition
            "
          >
            Filters
          </button>
        )}
      </DropdownMenu.Trigger>

      {/* DROPDOWN */}
      <DropdownMenu.Content
        align="start"
        sideOffset={8}
        className="
          z-50 w-56 rounded-md border border-border bg-background shadow-md
          p-2 animate-in fade-in zoom-in-95
        "
      >
        {filters.map((filter) => (
          <div key={filter.key} className="mb-2">
            
            {/* LABEL */}
            <div className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wide">
              {filter.label}
            </div>

            {/* OPTIONS */}
            {filter.options.map((opt) => {
              const checked = filter.value?.includes(opt.value)

              return (
                <DropdownMenu.Item
                  key={opt.value}
                  onSelect={(e) => {
                    e.preventDefault()

                    const current = filter.value || []

                    const next = checked
                      ? current.filter((v) => v !== opt.value)
                      : [...current, opt.value]

                    filter.onChange(next)
                  }}
                  className="
                    flex items-center justify-between px-2 py-2 text-sm
                    rounded-md cursor-pointer
                    hover:bg-muted
                    outline-none
                    data-[highlighted]:bg-muted
                  "
                >
                  <span>{opt.label}</span>

                  {checked && <Check className="h-4 w-4" />}
                </DropdownMenu.Item>
              )
            })}
          </div>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}