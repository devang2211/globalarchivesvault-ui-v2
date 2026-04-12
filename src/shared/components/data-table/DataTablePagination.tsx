import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { type Table } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

type Props<TData> = {
  table: Table<TData>
  total?: number
  className?: string
}

export function DataTablePagination<TData>({ table, total, className }: Props<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const currentPage = pageIndex + 1
  const totalPages = Math.max(1, table.getPageCount())

  // Derived range for "Showing X–Y of Z"
  const rowCount = total ?? 0
  const rangeStart = rowCount === 0 ? 0 : (pageIndex * pageSize) + 1
  const rangeEnd = Math.min(currentPage * pageSize, rowCount)

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className={cn(
      "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-2 py-1",
      className
    )}>

      {/* LEFT — result count */}
      <p className="text-sm text-muted-foreground shrink-0">
        {rowCount === 0 ? (
          "No results"
        ) : (
          <>
            Showing{" "}
            <span className="font-medium text-foreground">{rangeStart}</span>
            {" – "}
            <span className="font-medium text-foreground">{rangeEnd}</span>
            {" of "}
            <span className="font-medium text-foreground">{rowCount}</span>
            {" results"}
          </>
        )}
      </p>

      {/* RIGHT — rows-per-page + navigation */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <p className="hidden text-sm text-muted-foreground sm:block whitespace-nowrap">
            Rows per page
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(v) => {
              table.setPageSize(Number(v))
              table.setPageIndex(0)
            }}
          >
            <SelectTrigger className="h-8 w-fit min-w-14 gap-1 px-2.5">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50].map((s) => (
                <SelectItem key={s} value={`${s}`}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-5 hidden sm:block" />

        {/* Page navigation */}
        <div className="flex items-center gap-1">

          {/* First page */}
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page number buttons */}
          <div className="hidden sm:flex items-center gap-1">
            {pages.map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground select-none"
                  aria-hidden
                >
                  &#8230;
                </span>
              ) : (
                <Button
                  key={p}
                  variant={currentPage === p ? "default" : "ghost"}
                  className={cn(
                    "h-8 min-w-8 px-2 text-sm",
                    currentPage !== p && "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => table.setPageIndex((p as number) - 1)}
                  aria-label={`Go to page ${p}`}
                  aria-current={currentPage === p ? "page" : undefined}
                >
                  {p}
                </Button>
              )
            )}
          </div>

          {/* Compact page indicator (mobile) */}
          <span className="sm:hidden px-2 text-sm text-muted-foreground whitespace-nowrap">
            <span className="font-medium text-foreground">{currentPage}</span>
            {" / "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </span>

          {/* Next page */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

        </div>
      </div>
    </div>
  )
}
