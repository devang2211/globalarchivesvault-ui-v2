import { X } from "lucide-react"
import { type Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "./DataTableFacetedFilter"

type FilterConfig = {
  title: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  value: string[]
  onValueChange: (v: string[]) => void
}

type Props<TData> = {
  table: Table<TData>
  search: string
  onSearchChange: (v: string) => void
  searchPlaceholder?: string
  filters?: FilterConfig[]
  onClearFilters: () => void
  actions?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onClearFilters,
  actions,
}: Props<TData>) {
  const isFiltered = !!search || filters.some((f) => f.value.length > 0)

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex gap-x-2">
          {filters.map((filter) => (
            <DataTableFacetedFilter
              key={filter.title}
              title={filter.title}
              options={filter.options}
              value={filter.value}
              onValueChange={filter.onValueChange}
            />
          ))}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
