import { useState, useEffect, useCallback } from "react"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { Plus, Trash2, FolderOpen, Settings2, Clock, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table"

import { useClientContext } from "@/shared/hooks/useClientContext"
import { isSuperAdmin } from "@/shared/lib/auth"
import { getClient } from "@/features/client-management/api/client.api"
import { useTaxonomyLevel3s, useTaxonomyLevel4s } from "@/features/role-management/hooks/useRoles"
import { useMetadataFieldLookup, useSaveRecordTypeConfig } from "../hooks/useDocumentType"
import { getRecordTypeConfig } from "../api/document-type.api"
import { MetadataBlock } from "../components/MetadataBlock"
import { EmptyCell } from "../components/EmptyCell"
import type { LayoutItem, RetentionRule, MetadataFieldLookupDto } from "../api/document-type.api"

type MetadataGroup = { id: string; name: string }

const operatorMap: Record<string, string[]> = {
  text:    ["Equals", "Not Equals", "Contains"],
  number:  ["Equals", "Greater Than", "Less Than"],
  date:    ["Equals", "Before", "After"],
  lookup:  ["Equals"],
  boolean: ["Equals"],
}

/* ------------------------------------------------------------------ */

export default function DocumentTypePage() {

  /* Client context */
  const { selectedClient } = useClientContext({
    visible: isSuperAdmin(),
    onClientChange: useCallback((client: import("@/features/client-management/api/client.api").ClientDto | null) => {
      resetAll()
      if (client) loadClientDetail(client.id)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  })

  const [taxonomyLevel2Id, setTaxonomyLevel2Id] = useState<number | null>(null)
  const [frameworks, setFrameworks]             = useState<{ id: number; name: string }[]>([])

  async function loadClientDetail(clientId: number) {
    try {
      const detail = await getClient(clientId)
      setTaxonomyLevel2Id(detail.taxonomyLevel2Id ?? null)
      const allowed = (detail.regulatoryFrameworks ?? [])
        .filter(f => f.isAllowed)
        .map(f => ({ id: f.regulatoryFrameworkId, name: `Framework ${f.regulatoryFrameworkId}` }))
      setFrameworks(allowed)
    } catch { /* silent */ }
  }

  useEffect(() => {
    if (selectedClient && !isSuperAdmin()) loadClientDetail(selectedClient.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient?.id])

  /* Taxonomy */
  const [selectedL3Id, setSelectedL3Id] = useState<number | null>(null)
  const [selectedL4Id, setSelectedL4Id] = useState<number | null>(null)
  const { data: level3Items = [], isLoading: l3Loading } = useTaxonomyLevel3s(taxonomyLevel2Id)
  const { data: level4Items = [], isLoading: l4Loading } = useTaxonomyLevel4s(selectedL3Id)

  /* Config state */
  const [groups, setGroups]                     = useState<MetadataGroup[]>([])
  const [items, setItems]                       = useState<LayoutItem[]>([])
  const [rules, setRules]                       = useState<RetentionRule[]>([])
  const [permanentRetention, setPermanentRetention] = useState(false)
  const [configLoading, setConfigLoading]       = useState(false)

  /* Metadata fields */
  const { data: availableFields = [], isLoading: fieldsLoading } = useMetadataFieldLookup()
  const [fieldSearch, setFieldSearch] = useState("")
  const saveMutation = useSaveRecordTypeConfig()

  function resetAll() {
    setTaxonomyLevel2Id(null); setSelectedL3Id(null); setSelectedL4Id(null)
    setGroups([]); setItems([]); setRules([])
    setPermanentRetention(false); setFrameworks([])
  }

  function resetConfig() {
    setGroups([]); setItems([]); setRules([]); setPermanentRetention(false)
  }

  /* Load config on L4 change */
  useEffect(() => {
    if (!selectedL4Id) return
    setConfigLoading(true)
    getRecordTypeConfig(selectedL4Id)
      .then(config => {
        if (!config) { resetConfig(); return }
        setPermanentRetention(config.permanentRetention ?? false)
        const layout = (config.layout ?? []).map(x => ({ ...x, column: Number(x.column) as 1 | 2 }))
        setItems(layout)
        setRules(config.retentionRules ?? [])
        const groupMap = new Map<string, string>()
        layout.forEach(x => { if (!groupMap.has(x.groupId)) groupMap.set(x.groupId, x.groupName ?? "Group") })
        setGroups(Array.from(groupMap.entries()).map(([id, name]) => ({ id, name })))
      })
      .catch(() => toast.error("Failed to load configuration."))
      .finally(() => setConfigLoading(false))
  }, [selectedL4Id])

  /* Groups */
  function addGroup() {
    setGroups(prev => [...prev, { id: crypto.randomUUID(), name: "New Group" }])
  }
  function updateGroupName(id: string, value: string) {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, name: value } : g))
    setItems(prev => prev.map(i => i.groupId === id ? { ...i, groupName: value } : i))
  }
  function deleteGroup(id: string) {
    setGroups(prev => prev.filter(g => g.id !== id))
    setItems(prev => prev.filter(i => i.groupId !== id))
  }

  /* Fields */
  function addFieldToGroup(groupId: string, field: MetadataFieldLookupDto) {
    const groupFields = items.filter(i => i.groupId === groupId)
    const maxRow  = Math.max(0, ...groupFields.map(i => i.row))
    const usedCols = groupFields.filter(i => i.row === maxRow).map(i => i.column)
    const col: 1 | 2 = usedCols.includes(1) ? 2 : 1
    const row = col === 2 ? maxRow : maxRow + 1
    const group = groups.find(g => g.id === groupId)
    setItems(prev => [...prev, {
      id: crypto.randomUUID(), groupId,
      groupName: group?.name ?? "Group",
      row: row || 1, column: col,
      field: { ...field, encrypted: field.encrypted ?? false, masked: field.masked ?? false, searchable: field.searchable ?? true, options: field.options ?? [] },
    }])
  }
  function updateField(updated: LayoutItem) {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
  }
  function deleteField(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  /* DnD */
  function handleDragEnd(event: { active: { id: string | number }; over: { id: string | number } | null }) {
    const { active, over } = event
    if (!over) return
    const activeItem = items.find(i => i.id === active.id)
    if (!activeItem) return
    if (typeof over.id === "string" && over.id.startsWith("cell-")) {
      const parts  = over.id.split("-")
      const column = Number(parts.pop()) as 1 | 2
      const row    = Number(parts.pop())
      parts.shift()
      const groupId  = parts.join("-")
      const occupying = items.find(i => i.groupId === groupId && i.row === row && i.column === column)
      setItems(prev => prev.map(i => {
        if (i.id === activeItem.id) return { ...i, groupId, row, column }
        if (occupying && i.id === occupying.id) return { ...i, groupId: activeItem.groupId, row: activeItem.row, column: activeItem.column }
        return i
      }))
      return
    }
    const overItem = items.find(i => i.id === over.id)
    if (!overItem) return
    setItems(prev => prev.map(i => {
      if (i.id === activeItem.id) return { ...i, groupId: overItem.groupId, row: overItem.row, column: overItem.column }
      if (i.id === overItem.id)   return { ...i, groupId: activeItem.groupId, row: activeItem.row, column: activeItem.column }
      return i
    }))
  }

  /* Retention rules */
  function addRule() {
    setRules(prev => [...prev, { id: crypto.randomUUID(), fieldId: "", operator: "", value: "", triggerFieldId: "", period: 1, unit: "Years" }])
  }
  function updateRule(id: string, key: string, value: unknown) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r))
  }
  function deleteRule(id: string) {
    setRules(prev => prev.filter(r => r.id !== id))
  }
  function getFieldById(id: string) {
    return items.find(i => i.field.id === id)?.field
  }

  /* Save */
  function handleSave() {
    if (!selectedL4Id)   { toast.error("Select a Record Type first."); return }
    if (!selectedClient) { toast.error("Select a client first.");      return }
    saveMutation.mutate({
      taxonomyLevel4Id: selectedL4Id,
      clientId: selectedClient.id,
      permanentRetention,
      layout: items,
      retentionRules: rules,
    })
  }

  const filteredFields = availableFields.filter(f =>
    (f.displayName || f.name).toLowerCase().includes(fieldSearch.toLowerCase())
  )

  const isConfigured = !!selectedL4Id
  const selectedL3Name = level3Items.find(i => i.id === selectedL3Id)?.name
  const selectedL4Name = level4Items.find(i => i.id === selectedL4Id)?.name

  /* ---- UI ---- */
  return (
    <div className="space-y-5 max-w-6xl">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Record Type Configuration</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure metadata layout and retention rules per record type
          </p>
        </div>
        {isConfigured && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetConfig}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : "Save Configuration"}
            </Button>
          </div>
        )}
      </div>

      {/* ── Card 1: Record Type Context ── */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Record Type Context</CardTitle>
            </div>

            {/* Cascading selectors */}
            <div className="flex items-center gap-1.5">
              {/* L3 */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide px-0.5">Department</span>
                {l3Loading ? <Skeleton className="h-8 w-36" /> : (
                  <Select
                    value={selectedL3Id ? String(selectedL3Id) : ""}
                    onValueChange={v => { setSelectedL3Id(Number(v)); setSelectedL4Id(null); resetConfig() }}
                    disabled={!taxonomyLevel2Id}
                  >
                    <SelectTrigger className="h-8 w-40 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {level3Items.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 mt-4 shrink-0" />

              {/* L4 */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide px-0.5">Record Type</span>
                {l4Loading ? <Skeleton className="h-8 w-40" /> : (
                  <Select
                    value={selectedL4Id ? String(selectedL4Id) : ""}
                    onValueChange={v => setSelectedL4Id(Number(v))}
                    disabled={!selectedL3Id}
                  >
                    <SelectTrigger className="h-8 w-44 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {level4Items.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-3 pb-3">
          {selectedClient ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selectedClient.name}</span>
              {selectedClient.taxonomyLevel1Name && (
                <>
                  <span className="text-border">·</span>
                  <span>{selectedClient.taxonomyLevel1Name}</span>
                </>
              )}
              {selectedClient.taxonomyLevel2Name && (
                <>
                  <span className="text-border">/</span>
                  <span>{selectedClient.taxonomyLevel2Name}</span>
                </>
              )}
              <Badge
                variant={selectedClient.isActive ? "default" : "secondary"}
                className="text-[10px] h-4 px-1.5 ml-1"
              >
                {selectedClient.isActive ? "Active" : "Inactive"}
              </Badge>
              {isConfigured && (
                <>
                  <Separator orientation="vertical" className="h-4 mx-1" />
                  <span className="text-muted-foreground/60">{selectedL3Name}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                  <span className="font-medium text-foreground">{selectedL4Name}</span>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isSuperAdmin() ? "Select a client from the topbar to begin." : "Loading client…"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Card 2: Metadata Configuration ── */}
      <Card className={cn(!isConfigured && "opacity-60 pointer-events-none")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Metadata Configuration</CardTitle>
              {items.length > 0 && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">{items.length} field{items.length !== 1 && "s"}</Badge>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={addGroup} disabled={!isConfigured}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Group
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {configLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ) : !isConfigured ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground/25" />
              <p className="text-sm text-muted-foreground">Select a record type above to configure its metadata layout.</p>
            </div>
          ) : (
            <div className="flex gap-5">

              {/* ── Fields library ── */}
              <div className="w-56 shrink-0 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Field Library</p>
                <Input
                  placeholder="Search…"
                  value={fieldSearch}
                  onChange={e => setFieldSearch(e.target.value)}
                  className="h-7 text-xs"
                />
                <div className="space-y-0.5 max-h-[420px] overflow-y-auto pr-0.5">
                  {fieldsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)
                  ) : filteredFields.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">No fields found.</p>
                  ) : (
                    filteredFields.map(field => {
                      const alreadyAdded = items.some(i => i.field.id === field.id)
                      const typeColors: Record<string, string> = {
                        text:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                        number:  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                        date:    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                        lookup:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        boolean: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
                      }
                      return (
                        <div
                          key={field.id}
                          className={cn(
                            "flex items-start justify-between gap-1 px-2 py-2 rounded-md transition group/field",
                            alreadyAdded ? "opacity-40" : "hover:bg-muted/60"
                          )}
                        >
                          <div className="flex-1 min-w-0 space-y-0.5">
                            {/* Name */}
                            <p className="text-xs font-medium truncate leading-tight">
                              {field.displayName || field.name}
                            </p>
                            {/* Type badge + attribute dots */}
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className={cn("text-[10px] font-semibold px-1 py-0 rounded leading-4", typeColors[field.type] ?? typeColors.text)}>
                                {field.type}
                              </span>
                              {field.searchable && (
                                <span className="text-[10px] text-muted-foreground/70 leading-tight">Search</span>
                              )}
                              {field.encrypted && (
                                <span className="text-[10px] text-muted-foreground/70 leading-tight">Enc</span>
                              )}
                              {field.masked && (
                                <span className="text-[10px] text-muted-foreground/70 leading-tight">Mask</span>
                              )}
                            </div>
                          </div>
                          {/* Add button */}
                          {!alreadyAdded && groups.length > 0 && (
                            <Select onValueChange={groupId => addFieldToGroup(groupId, field)}>
                              <SelectTrigger className="h-5 w-5 p-0 border-0 shadow-none opacity-0 group-hover/field:opacity-100 transition-opacity mt-0.5 shrink-0">
                                <Plus className="h-3 w-3 text-muted-foreground" />
                              </SelectTrigger>
                              <SelectContent align="end">
                                {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                          {alreadyAdded && (
                            <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">Added</span>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
                {groups.length === 0 && !fieldsLoading && (
                  <p className="text-[11px] text-muted-foreground/60 text-center pt-1">
                    Add a group first, then assign fields.
                  </p>
                )}
              </div>

              <Separator orientation="vertical" className="h-auto self-stretch" />

              {/* ── Layout builder ── */}
              <div className="flex-1 min-w-0 space-y-4">
                {groups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center border-2 border-dashed rounded-xl border-border/50">
                    <p className="text-sm text-muted-foreground">Click <strong>Add Group</strong> to create a section,<br />then drag fields from the library.</p>
                  </div>
                ) : (
                  groups.map(group => {
                    const groupFields = items.filter(i => i.groupId === group.id)
                    const rows = Math.max(1, ...groupFields.map(i => i.row))
                    return (
                      <div key={group.id} className="rounded-xl border border-border/60 overflow-hidden">
                        {/* Group header */}
                        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/30 border-b border-border/40">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Input
                              value={group.name}
                              onChange={e => updateGroupName(group.id, e.target.value)}
                              className="h-7 text-sm font-medium border-0 shadow-none bg-transparent p-0 focus-visible:ring-0 focus-visible:bg-background focus-visible:px-2 focus-visible:rounded transition-all w-auto min-w-0 max-w-48"
                            />
                            <span className="text-xs text-muted-foreground shrink-0">
                              {groupFields.length} field{groupFields.length !== 1 && "s"}
                            </span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteGroup(group.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Grid */}
                        <div className="p-3">
                          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd as never}>
                            <SortableContext items={groupFields.map(i => i.id)} strategy={rectSortingStrategy}>
                              <div className="space-y-2">
                                {Array.from({ length: rows }).map((_, r) => {
                                  const left  = groupFields.find(i => i.row === r + 1 && i.column === 1)
                                  const right = groupFields.find(i => i.row === r + 1 && i.column === 2)
                                  return (
                                    <div key={r} className="grid grid-cols-2 gap-2">
                                      {left  ? <MetadataBlock item={left}  updateField={updateField} deleteField={deleteField} />
                                             : <EmptyCell row={r + 1} column={1} groupId={group.id} />}
                                      {right ? <MetadataBlock item={right} updateField={updateField} deleteField={deleteField} />
                                             : <EmptyCell row={r + 1} column={2} groupId={group.id} />}
                                    </div>
                                  )
                                })}
                              </div>
                            </SortableContext>
                          </DndContext>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card 3: Retention Rules ── */}
      <Card className={cn(!isConfigured && "opacity-60 pointer-events-none")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Retention Rules</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Permanent Retention</span>
                <Switch
                  checked={permanentRetention}
                  onCheckedChange={setPermanentRetention}
                  disabled={!isConfigured}
                />
              </div>
              {!permanentRetention && isConfigured && (
                <Button size="sm" variant="outline" onClick={addRule}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Rule
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {!isConfigured ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <Clock className="h-7 w-7 text-muted-foreground/25" />
              <p className="text-sm text-muted-foreground">Select a record type to configure retention policies.</p>
            </div>
          ) : permanentRetention ? (
            <div className="flex items-center justify-center py-6">
              <p className="text-sm text-muted-foreground">Documents of this type are retained indefinitely.</p>
            </div>
          ) : configLoading ? (
            <Skeleton className="h-24 w-full rounded-lg" />
          ) : (
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/60">
                    <TableHead className="text-xs">Framework</TableHead>
                    <TableHead className="text-xs">Condition Field</TableHead>
                    <TableHead className="text-xs">Operator</TableHead>
                    <TableHead className="text-xs">Value</TableHead>
                    <TableHead className="text-xs">Trigger Date</TableHead>
                    <TableHead className="text-xs w-20">Period</TableHead>
                    <TableHead className="text-xs w-24">Unit</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                        No retention rules yet. Click <strong>Add Rule</strong> to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rules.map(rule => (
                      <TableRow key={rule.id} className="hover:bg-muted/30 border-border/40">
                        <TableCell className="py-1.5">
                          <Select value={rule.frameworkId ? String(rule.frameworkId) : ""} onValueChange={v => updateRule(rule.id, "frameworkId", Number(v))}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {frameworks.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Select value={rule.fieldId || "none"} onValueChange={v => updateRule(rule.id, "fieldId", v === "none" ? "" : v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Field" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Condition</SelectItem>
                              {items.map(i => <SelectItem key={i.field.id} value={i.field.id}>{i.field.displayName || i.field.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Select value={rule.operator || ""} disabled={!rule.fieldId} onValueChange={v => updateRule(rule.id, "operator", v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Operator" /></SelectTrigger>
                            <SelectContent>
                              {rule.fieldId && getFieldById(rule.fieldId) &&
                                operatorMap[getFieldById(rule.fieldId)!.type]?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Input disabled={!rule.fieldId} value={rule.value} onChange={e => updateRule(rule.id, "value", e.target.value)} className="h-8 text-xs" />
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Select value={rule.triggerFieldId || ""} onValueChange={v => updateRule(rule.id, "triggerFieldId", v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Date field" /></SelectTrigger>
                            <SelectContent>
                              {items.filter(i => i.field.type === "date").map(i => (
                                <SelectItem key={i.field.id} value={i.field.id}>{i.field.displayName || i.field.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Input type="number" value={rule.period} onChange={e => updateRule(rule.id, "period", Number(e.target.value))} className="h-8 text-xs w-16" />
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Select value={rule.unit} onValueChange={v => updateRule(rule.id, "unit", v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Days">Days</SelectItem>
                              <SelectItem value="Months">Months</SelectItem>
                              <SelectItem value="Years">Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => deleteRule(rule.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky footer save bar — only when configured */}
      {isConfigured && (
        <div className="sticky bottom-0 -mx-6 px-6 py-3 border-t border-border bg-background/95 backdrop-blur-sm flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Editing: <span className="font-medium text-foreground">{selectedL3Name} › {selectedL4Name}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetConfig}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : "Save Configuration"}
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}
