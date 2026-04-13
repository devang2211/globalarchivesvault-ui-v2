import { useState } from "react"
import { Plus, Pencil, Search, ShieldCheck, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useMetadataFieldLookup, useUpsertMetadataField } from "../hooks/useMetadata"
import { MetadataFieldUpsertDialog } from "../components/MetadataFieldUpsertDialog"
import type { MetadataFieldLookupDto } from "../api/metadata.api"

type BooleanBadgeProps = {
  value: boolean
  trueLabel: string
  falseLabel: string
  trueClass: string
  icon: React.ReactNode
}

function BooleanBadge({ value, trueLabel, falseLabel, trueClass, icon }: BooleanBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        value ? trueClass : "bg-muted/60 text-muted-foreground"
      )}
    >
      {value && icon}
      {value ? trueLabel : falseLabel}
    </span>
  )
}

const DATA_TYPE_COLORS: Record<string, string> = {
  text: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  number: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  date: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  boolean: "bg-green-500/10 text-green-600 dark:text-green-400",
  lookup: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
}

type DialogState = {
  open: boolean
  id: number | null
  name: string
  dataType: string
  isEncrypted: boolean
  isMasked: boolean
  isSearchable: boolean
}

const CLOSED_DIALOG: DialogState = {
  open: false,
  id: null,
  name: "",
  dataType: "text",
  isEncrypted: false,
  isMasked: false,
  isSearchable: false,
}

export default function MetadataPage() {
  const { data: fields = [], isLoading } = useMetadataFieldLookup()
  const { mutate: upsert, isPending } = useUpsertMetadataField()
  const [dialog, setDialog] = useState<DialogState>(CLOSED_DIALOG)

  const openCreate = () =>
    setDialog({ open: true, id: null, name: "", dataType: "text", isEncrypted: false, isMasked: false, isSearchable: false })

  const openEdit = (field: MetadataFieldLookupDto) =>
    setDialog({
      open: true,
      id: field.id,
      name: field.name,
      dataType: field.dataType,
      isEncrypted: field.isEncrypted,
      isMasked: field.isMasked,
      isSearchable: field.isSearchable,
    })

  const handleSubmit = (values: Omit<DialogState, "open">) => {
    upsert(
      {
        id: values.id,
        name: values.name,
        dataType: values.dataType,
        isEncrypted: values.isEncrypted,
        isMasked: values.isMasked,
        isSearchable: values.isSearchable,
      },
      { onSuccess: () => setDialog(CLOSED_DIALOG) }
    )
  }

  return (
    <div className="h-full flex flex-col gap-0">

      {/* Page header */}
      <div className="flex items-start gap-3 mb-6">
        <span className="mt-0.5 w-1 self-stretch rounded-full bg-primary/70 shrink-0" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Metadata Fields</h1>
          <p className="text-sm text-muted-foreground">
            Define custom metadata fields used to describe and classify records.
          </p>
        </div>
      </div>

      {/* Content card */}
      <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-border/60 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/20 shrink-0">
          <span className="text-sm font-semibold text-foreground">
            {isLoading ? "" : `${fields.length} field${fields.length !== 1 ? "s" : ""}`}
          </span>
          <Button size="sm" onClick={openCreate} className="cursor-pointer h-7 gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add Field
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 px-2 py-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-7 w-7 rounded-md ml-auto" />
                </div>
              ))}
            </div>
          ) : fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
              <div className="rounded-full bg-muted p-4">
                <ShieldCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">No metadata fields yet</p>
                <p className="text-xs text-muted-foreground">
                  Add your first field to start describing records.
                </p>
              </div>
              <Button size="sm" onClick={openCreate} className="cursor-pointer gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add your first field
              </Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/10">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[35%]">
                    Name
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[18%]">
                    Data Type
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[15%]">
                    Searchable
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[15%]">
                    Encrypted
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[12%]">
                    Masked
                  </th>
                  <th className="px-4 py-2.5 w-[5%]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {fields.map(field => (
                  <tr
                    key={field.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{field.name}</span>
                    </td>

                    {/* Data Type */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          DATA_TYPE_COLORS[field.dataType] ??
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {field.dataType}
                      </span>
                    </td>

                    {/* Searchable */}
                    <td className="px-4 py-3">
                      <BooleanBadge
                        value={field.isSearchable}
                        trueLabel="Yes"
                        falseLabel="No"
                        trueClass="bg-green-500/10 text-green-700 dark:text-green-400"
                        icon={<Search className="h-3 w-3" />}
                      />
                    </td>

                    {/* Encrypted */}
                    <td className="px-4 py-3">
                      <BooleanBadge
                        value={field.isEncrypted}
                        trueLabel="Yes"
                        falseLabel="No"
                        trueClass="bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        icon={<ShieldCheck className="h-3 w-3" />}
                      />
                    </td>

                    {/* Masked */}
                    <td className="px-4 py-3">
                      <BooleanBadge
                        value={field.isMasked}
                        trueLabel="Yes"
                        falseLabel="No"
                        trueClass="bg-purple-500/10 text-purple-700 dark:text-purple-400"
                        icon={<EyeOff className="h-3 w-3" />}
                      />
                    </td>

                    {/* Edit action */}
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => openEdit(field)}
                        title="Edit field"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upsert dialog */}
      <MetadataFieldUpsertDialog
        open={dialog.open}
        onOpenChange={open => !open && setDialog(CLOSED_DIALOG)}
        defaultValues={{
          id: dialog.id,
          name: dialog.name,
          dataType: dialog.dataType,
          isEncrypted: dialog.isEncrypted,
          isMasked: dialog.isMasked,
          isSearchable: dialog.isSearchable,
        }}
        isPending={isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
