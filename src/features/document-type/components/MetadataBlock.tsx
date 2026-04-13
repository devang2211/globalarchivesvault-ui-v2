import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, X, Lock, Eye, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { LayoutItem, FieldType } from "../api/document-type.api"

type Props = {
  item: LayoutItem
  updateField: (item: LayoutItem) => void
  deleteField: (id: string) => void
}

const typeConfig: Record<FieldType, { label: string; color: string }> = {
  text:    { label: "Text",    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  number:  { label: "Number",  color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  date:    { label: "Date",    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  lookup:  { label: "Lookup",  color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  boolean: { label: "Boolean", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
}

export function MetadataBlock({ item, updateField, deleteField }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const field = item.field
  const type = typeConfig[field.type] ?? typeConfig.text

  function update(key: string, value: unknown) {
    updateField({ ...item, field: { ...field, [key]: value } })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-background transition-all duration-150",
        isDragging ? "shadow-lg ring-2 ring-primary/30 opacity-80 z-50" : "hover:border-border/80 hover:shadow-sm"
      )}
    >
      {/* Drag handle */}
      <GripVertical
        {...attributes}
        {...listeners}
        className="h-4 w-4 text-muted-foreground/30 cursor-grab group-hover:text-muted-foreground/60 shrink-0 transition-colors"
      />

      {/* Type badge */}
      <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0", type.color)}>
        {type.label}
      </span>

      {/* Field name */}
      <span className="flex-1 text-sm font-medium truncate min-w-0">
        {field.displayName || field.name || "Unnamed"}
      </span>

      {/* Attribute indicators */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {field.searchable && <Search className="h-3 w-3 text-muted-foreground/50" />}
        {field.encrypted && <Lock className="h-3 w-3 text-muted-foreground/50" />}
        {field.masked && <Eye className="h-3 w-3 text-muted-foreground/50" />}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <Pencil className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              <p className="text-sm font-semibold">Edit Field</p>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Display Name</label>
                <Input
                  value={field.displayName}
                  onChange={e => update("displayName", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Field Type</label>
                <Select value={field.type} onValueChange={v => update("type", v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="lookup">Lookup</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {field.type === "lookup" && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Options (one per line)</label>
                  <Textarea
                    rows={3}
                    placeholder="Option 1&#10;Option 2"
                    value={(field.options ?? []).join("\n")}
                    onChange={e => update("options", e.target.value.split("\n"))}
                    className="text-sm resize-none"
                  />
                </div>
              )}

              <div className="space-y-2 pt-1 border-t">
                {[
                  { key: "searchable", label: "Searchable", icon: Search },
                  { key: "encrypted",  label: "Encrypted",  icon: Lock },
                  { key: "masked",     label: "Masked",     icon: Eye },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </div>
                    <Switch
                      checked={!!field[key as keyof typeof field]}
                      onCheckedChange={v => update(key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => deleteField(item.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
