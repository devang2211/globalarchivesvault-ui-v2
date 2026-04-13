import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  row: number
  column: 1 | 2
  groupId: string
}

export function EmptyCell({ row, column, groupId }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${groupId}-${row}-${column}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-16 flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-xs text-muted-foreground/50 transition-all duration-150 select-none",
        isOver
          ? "border-primary/60 bg-primary/5 text-primary/70 scale-[1.01]"
          : "border-border/50 hover:border-border hover:text-muted-foreground/70"
      )}
    >
      <Plus className="h-3 w-3" />
      Drop field here
    </div>
  )
}
