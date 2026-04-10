import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"

type Props<T> = {
  data?: T[]   // ✅ allow undefined
  columns: ColumnDef<T>[]
  sorting?: string
  onSortChange?: (s: string) => void
  loading?: boolean
}

export function DataTable<T>({
  data = [],   // ✅ default empty array
  columns,
  sorting,
  onSortChange,
  loading,
}: Props<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        {/* HEADER */}
        <thead className="bg-muted/40 sticky top-0 z-10 backdrop-blur">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const id = header.column.id
                const isAsc = sorting === `${id}.asc`
                const isDesc = sorting === `${id}.desc`

                return (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left font-medium text-muted-foreground",
                      onSortChange && "cursor-pointer select-none"
                    )}
                    onClick={() => {
                      if (!onSortChange) return
                      const next = isAsc ? `${id}.desc` : `${id}.asc`
                      onSortChange(next)
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {onSortChange && (
                        <span className="flex flex-col">
                          <ChevronUp
                            className={cn(
                              "h-3 w-3",
                              isAsc
                                ? "text-foreground"
                                : "text-muted-foreground/40"
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 -mt-1",
                              isDesc
                                ? "text-foreground"
                                : "text-muted-foreground/40"
                            )}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>

        {/* BODY */}
        <tbody>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b">
                <td colSpan={columns.length} className="px-4 py-3">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10 text-muted-foreground"
              >
                No results found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="group border-b border-border/50 hover:bg-muted/40 transition"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}