import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/shared/components/data-table/DataTable"
import { useDataTableState } from "@/shared/hooks/useDataTableState"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { Eye, Pencil } from "lucide-react"
import { useState } from "react"

export const ClientsTable = ({
  data,
  total,
  search,
  navigate,
}: any) => {
  const { page, pageSize, setState } = useDataTableState(search, navigate)

  const [input, setInput] = useState(search.search ?? "")
  const debounced = useDebounce(input)

  // 🔥 SEARCH SYNC
  useState(() => {
    setState({ search: debounced })
  })

  const columns: ColumnDef<any>[] = [
    {
      header: "Client",
      accessorKey: "name",
    },
    {
      header: "Industry",
      cell: ({ row }) => (
        <>
          <div>{row.original.industry}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.institution}
          </div>
        </>
      ),
    },
    {
      header: "Location",
      accessorKey: "location",
    },
    {
      header: "Tier",
      accessorKey: "pricingTier",
    },
    {
      id: "actions",
      header: "",
      cell: () => (
        <div className="flex gap-2 justify-end">
          <Eye className="h-4 w-4 cursor-pointer" />
          <Pencil className="h-4 w-4 cursor-pointer" />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">

      {/* SEARCH */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search..."
        className="border px-3 py-2 rounded-md text-sm"
      />

      <DataTable
        data={data}
        columns={columns}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={(p) => setState({ page: p })}
        onSortChange={(sort) => setState({ sort })}
      />
    </div>
  )
}