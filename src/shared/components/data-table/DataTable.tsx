import { type ColumnDef, type Table as TanstackTable, flexRender } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

type Props<T> = {
  table: TanstackTable<T>
  columns: ColumnDef<T>[]
  loading?: boolean
}

export function DataTable<T>({ table, columns, loading }: Props<T>) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table className="min-w-xl">
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => {
                const meta = header.column.columnDef.meta as Record<string, string> | undefined
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(meta?.className, meta?.thClassName)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className={cn(
          "transition-opacity duration-200",
          loading && table.getRowModel().rows.length > 0 && "opacity-50 pointer-events-none"
        )}>
          {loading && table.getRowModel().rows.length === 0 ? (
            Array.from({ length: 8 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {table.getVisibleLeafColumns().map((column, colIndex) => {
                  const meta = column.columnDef.meta as Record<string, string> | undefined
                  const widths = ["w-3/4", "w-1/2", "w-5/6", "w-2/3", "w-1/3", "w-4/5"]
                  const width = widths[(rowIndex + colIndex) % widths.length]
                  return (
                    <TableCell
                      key={column.id}
                      className={cn("py-3", meta?.className, meta?.tdClassName)}
                    >
                      <Skeleton className={cn("h-4", width)} />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as Record<string, string> | undefined
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn("py-3", meta?.className, meta?.tdClassName)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
