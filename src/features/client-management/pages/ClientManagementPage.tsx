import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/shared/components/data-table/DataTable"
import { DataTableToolbar } from "@/shared/components/data-table/DataTableToolbar"
import { DataTablePagination } from "@/shared/components/data-table/DataTablePagination"
import { useDataTableState } from "@/shared/hooks/useDataTableState"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { getClients, type ClientDto } from "../api/client.api"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

const columns: ColumnDef<ClientDto>[] = [
  {
    header: "Client",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {row.original.name}
      </div>
    ),
  },
  {
    header: "Industry",
    accessorKey: "industry",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.industry}
      </div>
    ),
  },
  {
    header: "Location",
    accessorKey: "location",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.location}
      </div>
    ),
  },
  {
    header: "Contact",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.email}
        <br />
        {row.original.phone}
      </div>
    ),
  },
  {
    header: "Tier",
    accessorKey: "tier",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.tier}</Badge>
    ),
  },
  {
    header: "",
    id: "actions",
    cell: () => (
      <button className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-md hover:bg-muted">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    ),
  },
]

export default function ClientManagementPage() {
  const navigate = useNavigate()
  
const {
  page,
  pageSize,
  sort,
  searchText,
  setPage,
  setPageSize,
  setSort,
  setSearch,
  getFilter,
  setFilter,
  clearAllFilters, 
} = useDataTableState()
  const debounced = useDebounce(searchText)

  const [data, setData] = useState<ClientDto[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

const tierFilter = getFilter("tier")
const industryFilter = getFilter("industry")

const filters = [
  {
    key: "tier",
    label: "Tier",
    value: tierFilter,
    onChange: (v) => setFilter("tier", v),
    options: [
      { label: "Standard", value: "standard" },
      { label: "Enterprise", value: "enterprise" },
    ],
  },
  {
    key: "industry",
    label: "Industry",
    value: industryFilter,
    onChange: (v) => setFilter("industry", v),
    options: [
      { label: "Finance", value: "finance" },
      { label: "Healthcare", value: "healthcare" },
    ],
  },
]

  useEffect(() => {
    const load = async () => {
      setLoading(true)

const res = await getClients({
  page,
  pageSize,
  search: debounced,
  sort,
  tier: tierFilter,
  industry: industryFilter,
})

      setData(res.items)
      setTotal(res.total)
      setLoading(false)
    }

    load()
  }, [page, pageSize, sort, debounced])

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Client Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage your clients and their details
        </p>
      </div>

      {/* TOOLBAR */}
      
<DataTableToolbar
  search={searchText}
  setSearch={setSearch}
  filters={filters}
  onClearFilters={clearAllFilters}
  actions={
    <button
      onClick={() => navigate({ to: "/client-management/onboarding" })}
      className="
        h-9 px-4 flex items-center gap-2 rounded-md
        bg-primary text-primary-foreground
        hover:bg-primary/90 transition
      "
    >
      + Client Onboarding
    </button>
  }
/>

      {/* TABLE */}
      <DataTable
        data={data}
        columns={columns}
        sorting={sort}
        onSortChange={setSort}
        loading={loading}
      />

      {/* PAGINATION */}
<DataTablePagination
  page={page}
  pageSize={pageSize}
  total={total ?? 0}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
    </div>
  )
}