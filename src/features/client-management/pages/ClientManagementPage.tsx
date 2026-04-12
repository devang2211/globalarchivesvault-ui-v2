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
  Building2,
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/shared/components/data-table/DataTable"
import { DataTableToolbar } from "@/shared/components/data-table/DataTableToolbar"
import { DataTablePagination } from "@/shared/components/data-table/DataTablePagination"
import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeader"
import { useDataTableState } from "@/shared/hooks/useDataTableState"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { getTiers, type TierDto } from "@/features/tier-permissions/api/tier.api"

import { getClients, type ClientDto } from "../api/client.api"
import { ClientRowActions } from "../components/ClientRowActions"

/* ------------------------------------------------------------------ */
/* COLUMNS                                                              */
/* ------------------------------------------------------------------ */

const buildColumns = (): ColumnDef<ClientDto>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    meta: { className: "ps-4 w-[22%]" },
    cell: ({ row }) => (
      <span className="truncate">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "pricingTier",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pricing Tier" />,
    meta: { className: "ps-4" },
    enableSorting: false,
    cell: ({ row }) => {
      const tier = row.original.pricingTier
      if (!tier) return <span className="text-muted-foreground/40">—</span>
      return <Badge variant="outline">{tier}</Badge>
    },
  },
  {
    id: "institution",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Institution" />,
    meta: { className: "ps-4 w-[22%]" },
    enableSorting: false,
    cell: ({ row }) => {
      const l1 = row.original.taxonomyLevel1Name
      const l2 = row.original.taxonomyLevel2Name
      if (!l1 && !l2) return <span className="text-muted-foreground/40">—</span>
      return (
        <div className="flex flex-col gap-0.5">
          {l1 && <span className="text-sm leading-tight">{l1}</span>}
          {l2 && <span className="text-sm leading-tight">{l2}</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "onBoardingDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Onboard Date" />,
    meta: { className: "ps-4" },
    enableSorting: false,
    cell: ({ row }) => {
      const raw = row.original.onBoardingDate
      if (!raw) return <span className="text-muted-foreground/40">—</span>
      try {
        return <span>{format(new Date(raw), "MMM d, yyyy")}</span>
      } catch {
        return <span>{raw}</span>
      }
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    meta: { className: "ps-4" },
    enableSorting: false,
    cell: ({ row }) =>
      row.original.isActive ? (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-sm">Active</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <CircleOff className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-sm">Inactive</span>
        </div>
      ),
  },
  {
    accessorKey: "regulatoryFrameworks",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Regulatory Frameworks" />,
    meta: { className: "ps-4 w-[28%]" },
    enableSorting: false,
    cell: ({ row }) => {
      const raw = row.original.regulatoryFrameworks
      const frameworks = raw ? raw.split(",").map((f) => f.trim()).filter(Boolean) : []
      if (!frameworks.length) return <span className="text-muted-foreground/40">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {frameworks.map((f) => (
            <Badge key={f} variant="secondary" className="text-xs font-normal">
              {f}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ClientRowActions row={row.original} />,
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
  } = useDataTableState("client-management:filters")

  const debounced = useDebounce(searchText)

  const [data, setData] = useState<ClientDto[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const pricingTierFilter = getFilter("pricingTier")
  const statusFilter = getFilter("status")

  const [sorting, setSorting] = useState<SortingState>(
    sort ? [{ id: sort.split(".")[0], desc: sort.endsWith(".desc") }] : []
  )
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  useEffect(() => {
    getTiers().then(setTiers).catch(() => {})
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getClients({
        page,
        pageSize,
        sort: sort || undefined,
        pricingTierId: pricingTierFilter.length ? pricingTierFilter.map(Number) : undefined,
        status: statusFilter.length ? statusFilter.map((v) => v === "1") : undefined,
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
  }, [page, pageSize, sort, debounced, pricingTierFilter.join(","), statusFilter.join(",")])

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

  const columns = buildColumns()

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: { pageIndex: page - 1, pageSize },
      sorting,
      columnVisibility,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pageSize) || 1,
    onSortingChange: handleSortingChange as any,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange as any,
    getCoreRowModel: getCoreRowModel(),
  })

  const filters = [
    {
      title: "Pricing Tier",
      value: pricingTierFilter,
      onValueChange: (v: string[]) => setFilter("pricingTier", v),
      options: tiers.map((t) => ({ label: t.name, value: String(t.id) })),
    },
    {
      title: "Status",
      value: statusFilter,
      onValueChange: (v: string[]) => setFilter("status", v),
      options: [
        { label: "Active", value: "1", icon: CheckCircle2 },
        { label: "Inactive", value: "0", icon: CircleOff },
      ],
    },
  ]

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
            <Building2 className="mr-2 h-4 w-4" />
            Client Onboarding
          </Button>
        }
      />

      {/* TABLE */}
      <DataTable table={table} columns={columns} loading={loading} />

      {/* PAGINATION */}
      <DataTablePagination table={table} className="mt-auto" />

    </div>
  )
}
