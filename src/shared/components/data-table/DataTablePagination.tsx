import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  page: number
  pageSize: number
  total?: number   // ✅ allow undefined
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
}

export function DataTablePagination({
  page,
  pageSize,
  total = 0,   // ✅ FIX NaN
  onPageChange,
  onPageSizeChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize)) // ✅ safe

  const generatePages = () => {
    const pages: (number | "...")[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      if (page > 3) pages.push("...")

      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i)
      }

      if (page < totalPages - 2) pages.push("...")

      pages.push(totalPages)
    }

    return pages
  }

  const pages = generatePages()

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background">
      
      {/* LEFT */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="
            h-8 rounded-md border border-border bg-background
            px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring
          "
        >
          {[10, 20, 30, 50].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <span>Rows per page</span>
      </div>

      {/* CENTER */}
      <div className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1">
        {/* FIRST */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 transition"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* PREV */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* NUMBERS */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 text-sm text-muted-foreground">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "h-8 min-w-[32px] px-2 text-sm rounded-md border transition",
                p === page
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              {p}
            </button>
          )
        )}

        {/* NEXT */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* LAST */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 transition"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}