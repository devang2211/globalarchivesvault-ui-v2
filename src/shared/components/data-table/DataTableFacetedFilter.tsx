import { Check, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

type Option = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

type DataTableFacetedFilterProps = {
  title: string
  options: Option[]
  value: string[]
  onValueChange: (v: string[]) => void
}

export function DataTableFacetedFilter({
  title,
  options,
  value,
  onValueChange,
}: DataTableFacetedFilterProps) {
  const selectedValues = new Set(value.filter((v) => options.some((o) => o.value === v)))

  const toggle = (val: string) => {
    const next = new Set(selectedValues)
    if (next.has(val)) {
      next.delete(val)
    } else {
      next.add(val)
    }
    onValueChange(Array.from(next))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((opt) => selectedValues.has(opt.value))
                    .map((opt) => (
                      <Badge
                        key={opt.value}
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {opt.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selectedValues.has(opt.value)
                return (
                  <CommandItem key={opt.value} onSelect={() => toggle(opt.value)} className="cursor-pointer">
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="size-4 text-background" />
                    </div>
                    {opt.icon && (
                      <opt.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{opt.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onValueChange([])}
                    className="justify-center text-center cursor-pointer"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
