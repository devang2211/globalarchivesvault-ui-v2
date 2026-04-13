import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import * as Popover from "@radix-ui/react-popover"
import { Skeleton } from "@/components/ui/skeleton"
import { useClientContextRaw } from "@/app/providers/ClientContextProvider"
import type { ClientDto } from "@/features/client-management/api/client.api"

function ClientDot({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full shrink-0",
        isActive ? "bg-emerald-500" : "bg-amber-500"
      )}
    />
  )
}

export const ClientContextSelector = () => {
  const { selectedClient, clients, isLoading, selectorVisible, selectorDisabled, selectClient } =
    useClientContextRaw()

  const [open, setOpen] = useState(false)

  if (!selectorVisible) return null

  if (isLoading && !selectedClient) {
    return <Skeleton className="h-8 w-48 rounded-md" />
  }

  // Sort: active first (A–Z), then inactive (A–Z)
  const sorted = [...clients].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  const handleSelect = (client: ClientDto) => {
    selectClient(client.id === selectedClient?.id ? null : client)
    setOpen(false)
  }

  // Longest label among all options (including placeholder) — used to size the trigger
  const longestLabel = [
    "Select client…",
    ...sorted.map(c => c.name + (c.isActive ? "" : " (Inactive)")),
  ].reduce((a, b) => (a.length >= b.length ? a : b), "")

  return (
    <Popover.Root open={open} onOpenChange={(v) => !selectorDisabled && setOpen(v)}>
      <Popover.Trigger asChild>
        {/* Outer wrapper sizes itself to the longest option via the hidden ghost row */}
        <button
          type="button"
          disabled={selectorDisabled}
          className={cn(
            "relative h-8 inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 text-sm transition",
            "hover:bg-muted focus:outline-none",
            selectorDisabled && "opacity-60 cursor-not-allowed pointer-events-none"
          )}
        >
          {/* Hidden ghost — forces button width to fit the longest option */}
          <span aria-hidden className="invisible flex items-center gap-2 whitespace-nowrap">
            <span className="inline-block h-2 w-2 rounded-full shrink-0" />
            <span>{longestLabel}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0" />
          </span>

          {/* Visible content — absolutely overlaid on the ghost */}
          <span className="absolute inset-0 flex items-center gap-2 px-3">
            {selectedClient ? (
              <>
                <ClientDot isActive={selectedClient.isActive} />
                <span className="flex-1 truncate text-left">{selectedClient.name}</span>
              </>
            ) : (
              <span className="flex-1 text-muted-foreground">Select client…</span>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="end"
          className="z-50 w-[--radix-popover-trigger-width] rounded-md border border-border bg-background shadow-md p-0"
        >
          <Command>
            <CommandInput placeholder="Search clients…" />
            <CommandList>
              <CommandEmpty>No clients found.</CommandEmpty>
              <CommandGroup>
                {sorted.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.name}
                    onSelect={() => handleSelect(client)}
                    className={cn(!client.isActive && "text-muted-foreground/70")}
                  >
                    <ClientDot isActive={client.isActive} />
                    <span className="flex-1 truncate">
                      {client.name}
                      {!client.isActive && (
                        <span className="ml-1 text-[11px] text-muted-foreground/60">(Inactive)</span>
                      )}
                    </span>
                    {selectedClient?.id === client.id && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
