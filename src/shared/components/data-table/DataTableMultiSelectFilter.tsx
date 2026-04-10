import { useState } from "react"
import { Check, ChevronDown, Plus } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

type Option = {
  label: string
  value: string
}

type Props = {
  label: string
  options: Option[]
  value: string[]
  onChange: (v: string[]) => void
}

export function DataTableMultiSelectFilter({
  label,
  options,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false)

  const toggle = (val: string) => {
    const exists = value.includes(val)
    const next = exists
      ? value.filter((v) => v !== val)
      : [...value, val]

    onChange(next)
  }

  const clear = () => onChange([])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "h-9 px-3 flex items-center gap-2 rounded-md border text-sm transition",
            value.length > 0
              ? "border-primary bg-primary/5"
              : "border-border bg-background hover:bg-muted"
          )}
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>

          {value.length > 0 && (
            <>
              <span className="text-muted-foreground">|</span>

              <div className="flex items-center gap-1">
                {value.slice(0, 2).map((v) => (
                  <span
                    key={v}
                    className="px-1.5 py-0.5 rounded bg-muted text-xs"
                  >
                    {options.find((o) => o.value === v)?.label}
                  </span>
                ))}

                {value.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{value.length - 2}
                  </span>
                )}
              </div>
            </>
          )}

          <ChevronDown className="h-4 w-4 ml-1 opacity-60" />
        </button>
      </Popover.Trigger>

      <Popover.Content
        align="start"
        sideOffset={6}
        className="z-50 w-64 rounded-md border border-border bg-background shadow-md p-2"
      >
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {options.map((opt) => {
              const checked = value.includes(opt.value)

              return (
                <CommandItem
                  key={opt.value}
                  onSelect={() => toggle(opt.value)}
                  className="flex items-center justify-between"
                >
                  <span>{opt.label}</span>
                  {checked && <Check className="h-4 w-4" />}
                </CommandItem>
              )
            })}
          </CommandList>

          {/* CLEAR */}
          {value.length > 0 && (
            <div className="border-t mt-2 pt-2">
              <button
                onClick={clear}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </button>
            </div>
          )}
        </Command>
      </Popover.Content>
    </Popover.Root>
  )
}