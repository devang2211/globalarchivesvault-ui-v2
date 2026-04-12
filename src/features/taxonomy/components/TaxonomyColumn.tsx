import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pencil, Layers } from "lucide-react"

type TaxonomyItem = {
  id: number
  name: string
  isActive?: boolean
}

type Props = {
  title: string
  items: TaxonomyItem[]
  selectedId: number | null
  isLoading: boolean
  isDisabled: boolean
  disabledMessage?: string
  onSelect: (id: number) => void
  onAdd: () => void
  onEdit: (item: TaxonomyItem) => void
}

export function TaxonomyColumn({
  title,
  items,
  selectedId,
  isLoading,
  isDisabled,
  disabledMessage,
  onSelect,
  onAdd,
  onEdit,
}: Props) {
  return (
    <div
      className={cn(
        "flex-1 min-w-0 flex flex-col border-r border-border/60 last:border-r-0",
        isDisabled && "opacity-50 pointer-events-none"
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60 bg-muted/20 shrink-0">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide truncate">
          {title}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onAdd}
          className="h-6 w-6 p-0 shrink-0 ml-1"
          title={`Add ${title}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Column body */}
      <div className="flex-1 overflow-y-auto">
        {isDisabled && disabledMessage ? (
          <div className="flex flex-col items-center justify-center h-full px-3 py-6 gap-1.5 text-center">
            <Layers className="h-6 w-6 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">{disabledMessage}</p>
          </div>
        ) : isLoading ? (
          <div className="p-2 space-y-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2 px-2 py-2">
                <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                <Skeleton className="h-3.5 flex-1" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-3 py-6 gap-1.5 text-center">
            <p className="text-xs text-muted-foreground">No items yet.</p>
            <p className="text-xs text-muted-foreground/60">Click + to add one.</p>
          </div>
        ) : (
          <ul className="p-1.5 space-y-0.5">
            {items.map(item => {
              const isSelected = item.id === selectedId
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      "group w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors",
                      "hover:bg-muted/60",
                      isSelected && "bg-primary/10 ring-1 ring-primary/30"
                    )}
                  >
                    {/* Active dot */}
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        item.isActive !== false ? "bg-green-500" : "bg-muted-foreground/40"
                      )}
                    />

                    {/* Name */}
                    <span
                      className={cn(
                        "flex-1 text-xs truncate",
                        isSelected ? "font-medium text-foreground" : "text-foreground/80"
                      )}
                    >
                      {item.name}
                    </span>

                    {/* Edit button — shown on hover or when selected */}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        onEdit(item)
                      }}
                      className={cn(
                        "h-5 w-5 shrink-0 flex items-center justify-center rounded opacity-0 transition-opacity",
                        "group-hover:opacity-100 hover:bg-muted",
                        isSelected && "opacity-100"
                      )}
                      title={`Edit ${item.name}`}
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
