import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type Option = {
  label: string
  value: string
}

type FilterConfig = {
  key: string
  label: string
  options: Option[]
  value?: string[]
  onChange: (val: string[]) => void
}

type Props = {
  filters: FilterConfig[]
}

export function DataTableFilterChips({ filters }: Props) {
  const chips = filters.flatMap((f) =>
    (f.value || []).map((v) => {
      const opt = f.options.find((o) => o.value === v)
      return {
        key: f.key,
        value: v,
        label: opt?.label || v,
        remove: () =>
          f.onChange((f.value || []).filter((x) => x !== v)),
      }
    })
  )

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <div
          key={`${chip.key}-${chip.value}`}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-sm"
        >
          <span>{chip.label}</span>
          <button
            onClick={chip.remove}
            className="hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}