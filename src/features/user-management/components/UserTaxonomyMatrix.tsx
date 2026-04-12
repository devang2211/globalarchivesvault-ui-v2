import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRight, FolderOpen, Layers } from "lucide-react"
import {
  useTaxonomyLevel1s,
  useTaxonomyLevel2s,
  useTaxonomyLevel3s,
  useTaxonomyLevel4s,
} from "@/features/role-management/hooks/useRoles"
import type { UserForm } from "../schema/user.schema"

/* ---------------------------------- */
/* SHARED HELPERS */
/* ---------------------------------- */

const SkeletonRows = ({ count = 2 }: { count?: number }) => (
  <div className="space-y-1 py-1">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 flex-1 max-w-48" />
      </div>
    ))}
  </div>
)

/* ---------------------------------- */
/* L4 ROW — leaf with Allowed + Upload + Search */
/* ---------------------------------- */

type L4RowProps = {
  itemId: number
  itemName: string
  readonly?: boolean
}

function TaxonomyL4Row({ itemId, itemName, readonly }: L4RowProps) {
  const form = useFormContext<UserForm>()
  const taxonomyLevel4s = form.watch("taxonomyLevel4s")

  const entry = taxonomyLevel4s.find(t => t.taxonomyLevel4Id === itemId) ?? {
    taxonomyLevel4Id: itemId,
    isAllowed: false,
    canUpload: false,
    canSearch: false,
  }

  // When canUpload OR canSearch is on, isAllowed is forced true.
  // When both are off, isAllowed can be toggled independently.
  const eitherOn = entry.canUpload || entry.canSearch
  const isAllowed = eitherOn || entry.isAllowed

  const commit = (next: typeof entry) => {
    const exists = taxonomyLevel4s.some(t => t.taxonomyLevel4Id === itemId)
    if (exists) {
      form.setValue(
        "taxonomyLevel4s",
        taxonomyLevel4s.map(t => (t.taxonomyLevel4Id === itemId ? next : t))
      )
    } else {
      form.setValue("taxonomyLevel4s", [...taxonomyLevel4s, next])
    }
  }

  const updateToggle = (field: "canUpload" | "canSearch", value: boolean) => {
    const next = { ...entry, [field]: value }
    // Force isAllowed true whenever either sub-toggle is on
    if (next.canUpload || next.canSearch) next.isAllowed = true
    commit(next)
  }

  const toggleAllowed = (value: boolean) => {
    // Only reachable when both canUpload and canSearch are off
    commit({ ...entry, isAllowed: value })
  }

  return (
    <div
      className={cn(
        "group relative flex items-start pl-12 pr-4 py-2.5 transition-colors",
        !readonly && "hover:bg-muted/40"
      )}
    >
      {!readonly && (
        <span className="absolute left-0 inset-y-0 w-0.5 bg-primary/50 scale-y-0 group-hover:scale-y-100 transition-transform origin-center rounded-r-full" />
      )}
      {/* Name — flex-1 so it takes remaining space and wraps naturally */}
      <div className="flex items-start gap-2 flex-1 min-w-0 pt-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0 mt-1.5" />
        <span className="text-sm text-foreground/75 leading-snug">{itemName}</span>
      </div>
      {/* Allowed — clickable only when both Upload and Search are off; locked on when either is on */}
      <div className="w-20 shrink-0 flex justify-center pt-0.5">
        <Switch
          checked={isAllowed}
          disabled={readonly || eitherOn}
          onCheckedChange={toggleAllowed}
          className={cn(!readonly && !eitherOn && "cursor-pointer", eitherOn && "opacity-60")}
        />
      </div>
      {/* Upload */}
      <div className="w-20 shrink-0 flex justify-center pt-0.5">
        <Switch
          checked={entry.canUpload}
          disabled={readonly}
          onCheckedChange={val => updateToggle("canUpload", val)}
          className={cn(!readonly && "cursor-pointer")}
        />
      </div>
      {/* Search */}
      <div className="w-20 shrink-0 flex justify-center pt-0.5">
        <Switch
          checked={entry.canSearch}
          disabled={readonly}
          onCheckedChange={val => updateToggle("canSearch", val)}
          className={cn(!readonly && "cursor-pointer")}
        />
      </div>
    </div>
  )
}

/* ---------------------------------- */
/* L3 NODE — expands to show L4 rows */
/* ---------------------------------- */

type L3NodeProps = {
  nodeId: number
  nodeName: string
  readonly?: boolean
}

function TaxonomyL3Node({ nodeId, nodeName, readonly }: L3NodeProps) {
  const [expanded, setExpanded] = useState(false)
  const { data: items = [], isLoading } = useTaxonomyLevel4s(expanded ? nodeId : null)

  return (
    <div>
      {/* L3 header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 pl-8 pr-4 py-2 hover:bg-muted/40 transition-colors text-left"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-150",
            expanded && "rotate-90"
          )}
        />
        <span className="text-sm text-foreground/70 font-normal">{nodeName}</span>
      </button>

      {/* L4 rows */}
      {expanded && (
        <div className="border-l border-border/30 ml-10">
          {isLoading ? (
            <SkeletonRows count={2} />
          ) : items.length === 0 ? (
            <p className="pl-4 py-2 text-xs text-muted-foreground italic">No items</p>
          ) : (
            items.map(item => (
              <TaxonomyL4Row key={item.id} itemId={item.id} itemName={item.name} readonly={readonly} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------- */
/* L2 NODE — expands to show L3 nodes */
/* ---------------------------------- */

type L2NodeProps = {
  nodeId: number
  nodeName: string
  readonly?: boolean
}

function TaxonomyL2Node({ nodeId, nodeName, readonly }: L2NodeProps) {
  const [expanded, setExpanded] = useState(false)
  const { data: items = [], isLoading } = useTaxonomyLevel3s(expanded ? nodeId : null)

  return (
    <div>
      {/* L2 header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 pl-5 pr-4 py-2.5 hover:bg-muted/50 transition-colors text-left bg-muted/20"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-150",
            expanded && "rotate-90"
          )}
        />
        <span className="text-sm text-foreground/80">{nodeName}</span>
      </button>

      {/* L3 nodes */}
      {expanded && (
        <div className="border-l border-border/30 ml-7">
          {isLoading ? (
            <SkeletonRows count={2} />
          ) : items.length === 0 ? (
            <p className="pl-4 py-2 text-xs text-muted-foreground italic">No sub-categories</p>
          ) : (
            items.map(item => (
              <TaxonomyL3Node key={item.id} nodeId={item.id} nodeName={item.name} readonly={readonly} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------- */
/* L1 NODE — expands to show L2 nodes */
/* ---------------------------------- */

type L1NodeProps = {
  nodeId: number
  nodeName: string
  readonly?: boolean
}

function TaxonomyL1Node({ nodeId, nodeName, readonly }: L1NodeProps) {
  const [expanded, setExpanded] = useState(false)
  const { data: items = [], isLoading } = useTaxonomyLevel2s(expanded ? nodeId : null)

  return (
    <div className="border-b border-border/30 last:border-b-0">
      {/* L1 header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-muted/60 transition-colors text-left bg-muted/40"
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-200",
            expanded && "rotate-90"
          )}
        />
        <span className="text-sm font-medium text-foreground">{nodeName}</span>
      </button>

      {/* L2 nodes */}
      {expanded && (
        <div>
          {isLoading ? (
            <SkeletonRows count={3} />
          ) : items.length === 0 ? (
            <p className="pl-8 py-2 text-xs text-muted-foreground italic">No categories</p>
          ) : (
            items.map(item => (
              <TaxonomyL2Node key={item.id} nodeId={item.id} nodeName={item.name} readonly={readonly} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------- */
/* ROOT: UserTaxonomyMatrix */
/* ---------------------------------- */

type Props = {
  readonly?: boolean
}

export function UserTaxonomyMatrix({ readonly }: Props) {
  const { data: level1Items = [], isLoading } = useTaxonomyLevel1s()

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      {/* Column header — Allowed (derived) + Upload + Search */}
      <div className="sticky top-0 z-10 flex items-center bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <span className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Taxonomy
        </span>
        <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
          Allowed
        </span>
        <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
          Upload
        </span>
        <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
          Search
        </span>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="p-4">
          <SkeletonRows count={4} />
        </div>
      ) : level1Items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
          <Layers className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No taxonomy items available.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/20">
          {level1Items.map(item => (
            <TaxonomyL1Node key={item.id} nodeId={item.id} nodeName={item.name} readonly={readonly} />
          ))}
        </div>
      )}

      {/* Expand hint */}
      {!isLoading && level1Items.length > 0 && (
        <div className="border-t border-border/30 px-4 py-2 flex items-center gap-1.5">
          <FolderOpen className="h-3.5 w-3.5 text-muted-foreground/40" />
          <span className="text-xs text-muted-foreground/60">
            Click a category to expand and assign access
          </span>
        </div>
      )}
    </div>
  )
}
