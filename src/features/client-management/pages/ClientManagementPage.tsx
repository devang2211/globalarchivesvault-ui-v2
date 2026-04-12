import { useEffect, useState } from "react"
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useNavigate } from "@tanstack/react-router"
import {
  CheckCircle2,
  CircleOff,
  UserPlus,
  Trash2,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/shared/components/data-table/DataTable"
import { DataTableToolbar } from "@/shared/components/data-table/DataTableToolbar"
import { DataTablePagination } from "@/shared/components/data-table/DataTablePagination"
import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeader"
import { DataTableBulkActions } from "@/shared/components/data-table/DataTableBulkActions"
import { useDataTableState } from "@/shared/hooks/useDataTableState"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { getTiers, type TierDto } from "@/features/tier-permissions/api/tier.api"

import { getClients, deleteClient, type ClientDto } from "../api/client.api"
import { ClientRowActions } from "../components/ClientRowActions"

/* ------------------------------------------------------------------ */
/* COLUMNS                                                              */
/* ------------------------------------------------------------------ */

const buildColumns = (onDeleted: () => void): ColumnDef<ClientDto>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
    meta: { className: "ps-1 max-w-0 w-[30%]", tdClassName: "ps-4" },
    cell: ({ row }) => {
      const tier = row.original.tier
      return (
        <div className="flex items-center space-x-2">
          {tier && <Badge variant="outline">{tier}</Badge>}
          <span className="truncate font-medium">{row.original.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "industry",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Industry" />,
    meta: { className: "ps-1", tdClassName: "ps-4" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.industry ?? "—"}</span>
    ),
  },
  {
    accessorKey: "location",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
    meta: { className: "ps-1", tdClassName: "ps-4" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.location ?? "—"}</span>
    ),
  },
  {
    accessorKey: "contactEmail",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
    meta: { className: "ps-1", tdClassName: "ps-4" },
    enableSorting: false,
    cell: ({ row }) => {
      const { contactEmail, contactPhone } = row.original
      if (!contactEmail && !contactPhone)
        return <span className="text-muted-foreground/40">—</span>
      return (
        <div className="space-y-0.5 text-sm text-muted-foreground">
          {contactEmail && <div>{contactEmail}</div>}
          {contactPhone && <div>{contactPhone}</div>}
        </div>
      )
    },
  },
  {
    accessorKey: "onBoardingDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Onboarded" />,
    meta: { className: "ps-1", tdClassName: "ps-4" },
    cell: ({ row }) => {
      const raw = row.original.onBoardingDate
      if (!raw) return <span className="text-muted-foreground/40">—</span>
      try {
        return (
          <span className="text-muted-foreground">
            {format(new Date(raw), "MMM d, yyyy")}
          </span>
        )
      } catch {
        return <span className="text-muted-foreground">{raw}</span>
      }
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    meta: { className: "ps-1", tdClassName: "ps-4" },
    cell: ({ row }) =>
      row.original.isActive ? (
        <div className="flex w-[90px] items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <span>Active</span>
        </div>
      ) : (
        <div className="flex w-[90px] items-center gap-2">
          <CircleOff className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Inactive</span>
        </div>
      ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ClientRowActions row={row.original} onDeleted={onDeleted} />,
  },
]

/* ------------------------------------------------------------------ */
/* PAGE                                                                 */
/* ------------------------------------------------------------------ */

export default function ClientManagementPage() {
  const navigate = useNavigate()
  const [tiers, setTiers] = useState<TierDto[]>([])

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
  const statusFilter = getFilter("status")

  const [sorting, setSorting] = useState<SortingState>(
    sort ? [{ id: sort.split(".")[0], desc: sort.endsWith(".desc") }] : []
  )
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    location: false,
    contactEmail: false,
    onBoardingDate: false,
  })
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    getTiers().then(setTiers).catch(() => {})
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getClients({
        page,
        pageSize,
        search: debounced || undefined,
        sort: sort || undefined,
        tier: tierFilter.length ? tierFilter : undefined,
        isActive: statusFilter.length ? statusFilter : undefined,
      })
      setData(res.items)
      setTotal(res.total)
    } catch {
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sort, debounced, tierFilter.join(","), statusFilter.join(",")])

  const handleSortingChange = (
    updater: SortingState | ((prev: SortingState) => SortingState)
  ) => {
    const next = typeof updater === "function" ? updater(sorting) : updater
    setSorting(next)
    const newSort = next.length
      ? `${next[0].id}.${next[0].desc ? "desc" : "asc"}`
      : ""
    if (newSort !== sort) setSort(newSort)
  }

  const handlePaginationChange = (
    updater: PaginationState | ((prev: PaginationState) => PaginationState)
  ) => {
    const prev: PaginationState = { pageIndex: page - 1, pageSize }
    const next = typeof updater === "function" ? updater(prev) : updater
    if (next.pageIndex + 1 !== page) setPage(next.pageIndex + 1)
    if (next.pageSize !== pageSize) setPageSize(next.pageSize)
  }

  const columns = buildColumns(load)

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: { pageIndex: page - 1, pageSize },
      sorting,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pageSize) || 1,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange as any,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange as any,
    getCoreRowModel: getCoreRowModel(),
  })

  const filters = [
    {
      title: "Tier",
      value: tierFilter,
      onValueChange: (v: string[]) => setFilter("tier", v),
      options: tiers.map((t) => ({ label: t.name, value: String(t.id) })),
    },
    {
      title: "Status",
      value: statusFilter,
      onValueChange: (v: string[]) => setFilter("status", v),
      options: [
        { label: "Active", value: "true", icon: CheckCircle2 },
        { label: "Inactive", value: "false", icon: CircleOff },
      ],
    },
  ]

  /* Bulk delete */
  const handleBulkDelete = async () => {
    const selected = table.getFilteredSelectedRowModel().rows
    if (!selected.length) return
    try {
      await Promise.all(selected.map((r) => deleteClient((r.original as ClientDto).id)))
      toast.success(`${selected.length} client${selected.length > 1 ? "s" : ""} deleted`)
      table.resetRowSelection()
      load()
    } catch {
      toast.error("Failed to delete selected clients.")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">

      {/* PAGE HEADER */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-1 self-stretch rounded-full bg-primary/70 shrink-0" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Client Management</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your clients
          </p>
        </div>
      </div>

      {/* TOOLBAR */}
      <DataTableToolbar
        table={table}
        search={searchText}
        onSearchChange={setSearch}
        searchPlaceholder="Search clients..."
        filters={filters}
        onClearFilters={clearAllFilters}
        actions={
          <Button
            onClick={() => navigate({ to: "/client-management/onboarding" })}
            className="h-8 cursor-pointer"
            size="sm"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Client Onboarding
          </Button>
        }
      />

      {/* TABLE */}
      <DataTable table={table} columns={columns} loading={loading} />

      {/* PAGINATION */}
      <DataTablePagination table={table} className="mt-auto" />

      {/* BULK ACTIONS */}
      <DataTableBulkActions table={table} entityName="client">
        <Button
          variant="destructive"
          size="sm"
          className="h-8 cursor-pointer"
          onClick={handleBulkDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </DataTableBulkActions>

    </div>
  )
}
