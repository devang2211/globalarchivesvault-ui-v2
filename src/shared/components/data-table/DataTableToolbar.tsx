import { Input } from "@/components/ui/input"
import { DataTableMultiSelectFilter } from "./DataTableMultiSelectFilter"
import { X } from "lucide-react"

type Props = {
  search: string
  setSearch: (v: string) => void
  filters: {
    key: string
    label: string
    options: { label: string; value: string }[]
    value: string[]
    onChange: (v: string[]) => void
  }[]
  onClearFilters: () => void

  // ✅ dynamic actions slot
  actions?: React.ReactNode
}

export function DataTableToolbar({
  search,
  setSearch,
  filters,
  onClearFilters,
  actions,
}: Props) {
  const hasFilters = filters.some((f) => f.value.length > 0)

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      
      {/* LEFT */}
      <div className="flex items-center gap-2 flex-wrap">
        
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="h-9 w-72"
        />

        {filters.map((filter) => (
          <DataTableMultiSelectFilter
            key={filter.key}
            label={filter.label}
            options={filter.options}
            value={filter.value}
            onChange={filter.onChange}
          />
        ))}

        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="ml-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Reset
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* RIGHT (DYNAMIC) */}
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}